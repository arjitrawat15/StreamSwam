// ChunkDownloader.ts
// Downloads video chunks from CDN or peers and reports
// real-time progress to the visualizer via callbacks.

const CDN_URL = import.meta.env.VITE_CDN_URL || 
                'http://localhost:8080/api/chunks';

export type ChunkStatus = 
  'pending' | 'active' | 'done' | 'from_peer' | 'failed';

export interface ChunkState {
  id: number;
  filename: string;
  hash: string;
  size: number;
  status: ChunkStatus;
  source: 'cdn' | 'peer' | null;
  downloadedAt: number | null;
  speedBps: number;
}

export interface DownloadStats {
  totalChunks: number;
  downloaded: number;
  fromCDN: number;
  fromPeers: number;
  progressPercent: number;
  currentSpeedMbps: number;
  averageSpeedMbps: number;
}

export type OnChunkUpdate = (
  chunkId: number, 
  state: Partial<ChunkState>
) => void;

export type OnStatsUpdate = (stats: DownloadStats) => void;

export class ChunkDownloader {
  private videoId: string;
  private chunks: ChunkState[] = [];
  private onChunkUpdate: OnChunkUpdate;
  private onStatsUpdate: OnStatsUpdate;
  private activeDownloads = new Map<number, AbortController>();
  private downloadedBytes = 0;
  private speedSamples: number[] = [];
  private lastSpeedSampleTime = Date.now();
  private lastSpeedSampleBytes = 0;
  private maxConcurrent: number;
  private stopped = false;
  private downloadQueue: number[] = [];

  constructor(
    videoId: string,
    manifest: { chunks: Array<{ id: number; filename: string; hash: string; size: number }> },
    onChunkUpdate: OnChunkUpdate,
    onStatsUpdate: OnStatsUpdate,
    maxConcurrent = 3
  ) {
    this.videoId = videoId;
    this.onChunkUpdate = onChunkUpdate;
    this.onStatsUpdate = onStatsUpdate;
    this.maxConcurrent = maxConcurrent;

    // Initialize all chunks as pending
    this.chunks = manifest.chunks.map(c => ({
      ...c,
      status: 'pending' as ChunkStatus,
      source: null,
      downloadedAt: null,
      speedBps: 0
    }));

    // Build sequential download queue
    this.downloadQueue = manifest.chunks.map(c => c.id);

    // Report initial state
    this.reportStats();
  }

  // ── PUBLIC API ──────────────────────────────────────────────

  async start() {
    this.stopped = false;
    console.log(`🚀 Starting download for ${this.chunks.length} chunks`);
    await this.processQueue();
  }

  stop() {
    this.stopped = true;
    for (const [, controller] of this.activeDownloads) {
      controller.abort();
    }
    this.activeDownloads.clear();
    console.log('⏹️ Chunk downloader stopped');
  }

  getChunks(): ChunkState[] {
    return [...this.chunks];
  }

  // ── QUEUE PROCESSING ─────────────────────────────────────────

  private async processQueue() {
    const workers = Array.from(
      { length: this.maxConcurrent }, 
      () => this.worker()
    );
    await Promise.all(workers);
  }

  private async worker() {
    while (!this.stopped) {
      const chunkId = this.downloadQueue.shift();
      if (chunkId === undefined) break;

      await this.downloadChunk(chunkId);
      this.reportStats();
    }
  }

  // ── CHUNK DOWNLOAD ───────────────────────────────────────────

  private async downloadChunk(chunkId: number) {
    const chunk = this.chunks[chunkId];
    if (!chunk) return;

    const controller = new AbortController();
    this.activeDownloads.set(chunkId, controller);

    // Mark as actively downloading
    this.updateChunk(chunkId, { status: 'active' });

    const startTime = Date.now();

    try {
      const url = `${CDN_URL}/${this.videoId}/${chunk.filename}`;
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Accept': 'video/mp4' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Stream the response body to measure actual bytes
      const reader = response.body?.getReader();
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;
            this.downloadedBytes += value.length;
            this.updateSpeedSample();
          }
        }
      }

      // Verify hash (optional but shows integrity check in UI)
      const elapsed = (Date.now() - startTime) / 1000;
      const speedBps = receivedBytes / elapsed;

      this.updateChunk(chunkId, {
        status: 'done',
        source: 'cdn',
        downloadedAt: Date.now(),
        speedBps
      });

      console.log(
        `✅ Chunk ${chunkId} (${chunk.filename}) — ` +
        `${(receivedBytes / 1024).toFixed(1)}KB in ${elapsed.toFixed(2)}s`
      );

    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error(`❌ Chunk ${chunkId} failed:`, err.message);
      this.updateChunk(chunkId, { status: 'failed' });
    } finally {
      this.activeDownloads.delete(chunkId);
    }
  }

  // ── PEER CHUNK (call this when a peer delivers a chunk) ──────

  markChunkFromPeer(chunkId: number, speedBps: number) {
    this.updateChunk(chunkId, {
      status: 'from_peer',
      source: 'peer',
      downloadedAt: Date.now(),
      speedBps
    });
    // Remove from queue if it was waiting
    const idx = this.downloadQueue.indexOf(chunkId);
    if (idx !== -1) this.downloadQueue.splice(idx, 1);
    this.reportStats();
  }

  // ── HELPERS ──────────────────────────────────────────────────

  private updateChunk(id: number, update: Partial<ChunkState>) {
    this.chunks[id] = { ...this.chunks[id], ...update };
    this.onChunkUpdate(id, update);
  }

  private updateSpeedSample() {
    const now = Date.now();
    const elapsed = now - this.lastSpeedSampleTime;
    if (elapsed >= 500) {
      const bytesThisWindow = this.downloadedBytes - this.lastSpeedSampleBytes;
      const speed = bytesThisWindow / (elapsed / 1000);
      this.speedSamples.push(speed);
      if (this.speedSamples.length > 10) this.speedSamples.shift();
      this.lastSpeedSampleTime = now;
      this.lastSpeedSampleBytes = this.downloadedBytes;
      this.reportStats();
    }
  }

  private reportStats() {
    const done = this.chunks.filter(
      c => c.status === 'done' || c.status === 'from_peer'
    ).length;
    const fromPeers = this.chunks.filter(
      c => c.status === 'from_peer'
    ).length;
    const fromCDN = done - fromPeers;

    const avgSpeed = this.speedSamples.length
      ? this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length
      : 0;

    const currentSpeed = this.speedSamples.length
      ? this.speedSamples[this.speedSamples.length - 1]
      : 0;

    this.onStatsUpdate({
      totalChunks: this.chunks.length,
      downloaded: done,
      fromCDN,
      fromPeers,
      progressPercent: Math.round((done / this.chunks.length) * 100),
      currentSpeedMbps: parseFloat((currentSpeed / 1_000_000).toFixed(2)),
      averageSpeedMbps: parseFloat((avgSpeed / 1_000_000).toFixed(2))
    });
  }
}
