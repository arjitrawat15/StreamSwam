// useChunkDownloader.ts
// React hook that drives the chunk visualizer with real data.

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChunkDownloader, 
  ChunkState, 
  DownloadStats,
  ChunkStatus 
} from '../services/ChunkDownloader';

const API_URL = import.meta.env.VITE_API_URL || 
                'http://localhost:8080/api';

interface Manifest {
  video_id: string;
  total_chunks: number;
  chunk_duration: number;
  chunks: Array<{
    id: number;
    filename: string;
    hash: string;
    size: number;
    url: string;
  }>;
}

export function useChunkDownloader(videoId: string | null) {
  const [chunks, setChunks] = useState<ChunkState[]>([]);
  const [stats, setStats] = useState<DownloadStats>({
    totalChunks: 0,
    downloaded: 0,
    fromCDN: 0,
    fromPeers: 0,
    progressPercent: 0,
    currentSpeedMbps: 0,
    averageSpeedMbps: 0
  });
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const downloaderRef = useRef<ChunkDownloader | null>(null);

  // Callback fired every time a single chunk changes state
  const handleChunkUpdate = useCallback(
    (chunkId: number, update: Partial<ChunkState>) => {
      setChunks(prev => {
        const next = [...prev];
        if (next[chunkId]) {
          next[chunkId] = { ...next[chunkId], ...update };
        }
        return next;
      });
    },
    []
  );

  // Callback fired for aggregate stats updates
  const handleStatsUpdate = useCallback((newStats: DownloadStats) => {
    setStats(newStats);
  }, []);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Wait for video to be ready
        let ready = false;
        let retries = 0;
        while (!ready && retries < 30 && !cancelled) {
          const statusRes = await fetch(
            `${API_URL}/videos/${videoId}/status`
          );
          if (!statusRes.ok) {
              if (statusRes.status === 404) {
                 // Try manifest directly if status route doesn't exist, handle gracefully
                 ready = true;
                 break;
              }
              throw new Error(`HTTP ${statusRes.status}`);
          }
          const statusData = await statusRes.json();

          if (statusData.status === 'ready' || statusData.status === 'completed') {
            ready = true;
          } else if (statusData.status === 'failed') {
            throw new Error('Video processing failed on server');
          } else {
            // Still processing — poll every 2 seconds
            await new Promise(r => setTimeout(r, 2000));
            retries++;
          }
        }

        if (!ready) throw new Error('Video took too long to process');
        if (cancelled) return;

        // 2. Fetch manifest
        const manifestRes = await fetch(
          `${API_URL}/videos/${videoId}/manifest`
        );
        if (!manifestRes.ok) {
          throw new Error('Failed to fetch manifest');
        }
        const manifestData: Manifest = await manifestRes.json();
        if (cancelled) return;

        setManifest(manifestData);

        // 3. Initialize chunk downloader with real manifest
        const downloader = new ChunkDownloader(
          videoId,
          manifestData,
          handleChunkUpdate,
          handleStatsUpdate,
          3  // 3 concurrent downloads
        );

        downloaderRef.current = downloader;
        setIsLoading(false);

        // 4. Initialize chunk states in React
        setChunks(downloader.getChunks());

        // 5. Start downloading
        downloader.start();

      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Download failed');
          setIsLoading(false);
          console.error('ChunkDownloader init error:', err);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (downloaderRef.current) {
        downloaderRef.current.stop();
        downloaderRef.current = null;
      }
    };
  }, [videoId, handleChunkUpdate, handleStatsUpdate]);

  return { chunks, stats, manifest, error, isLoading };
}
