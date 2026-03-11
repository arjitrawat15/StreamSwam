import { useState, useEffect, useCallback, useRef } from 'react';

export type ChunkStatus = 'pending' | 'downloading' | 'p2p' | 'cdn' | 'playing' | 'failed';

export interface Chunk {
  id: number;
  status: ChunkStatus;
  size: number;
  source?: string;
  downloadedAt?: Date;
  speed?: number;
}

const TOTAL_CHUNKS = 150;
const CHUNK_SIZE_MIN = 1.5;
const CHUNK_SIZE_MAX = 3.5;

export const useChunkSimulation = (p2pEnabled: boolean, peerCount: number) => {
  const [chunks, setChunks] = useState<Chunk[]>(() =>
    Array.from({ length: TOTAL_CHUNKS }, (_, i) => ({
      id: i,
      status: 'pending' as ChunkStatus,
      size: CHUNK_SIZE_MIN + Math.random() * (CHUNK_SIZE_MAX - CHUNK_SIZE_MIN),
    }))
  );
  const [currentChunk, setCurrentChunk] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState<number[]>(Array(120).fill(0));
  const [totalDownloaded, setTotalDownloaded] = useState(0);
  const [p2pDownloaded, setP2pDownloaded] = useState(0);
  const [cdnDownloaded, setCdnDownloaded] = useState(0);
  const downloadingRef = useRef<Set<number>>(new Set());

  // Real config mappings
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const cdnUrl = import.meta.env.VITE_CDN_URL || 'http://localhost:8080/api/chunks';
  const videoId = new URLSearchParams(window.location.search).get('v') || 'demo-video';

  const getRandomPeerId = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'peer_';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }, []);

  const markChunkDownloading = useCallback((chunkId: number) => {
    if (downloadingRef.current.has(chunkId)) return;
    downloadingRef.current.add(chunkId);

    setChunks((prev) =>
      prev.map((chunk) =>
        chunk.id === chunkId ? { ...chunk, status: 'downloading' } : chunk
      )
    );

    // Complete after random time, representing actual download from CDN or P2P
    const downloadTime = 500 + Math.random() * 1500;
    setTimeout(() => {
      downloadingRef.current.delete(chunkId);

      // Determine source (75% P2P if enabled and has peers, else CDN)
      const isP2p = p2pEnabled && peerCount > 0 && Math.random() < 0.75;
      const status: ChunkStatus = isP2p ? 'p2p' : 'cdn';
      
      // If CDN, representing fetching from cdnUrl
      const sourceStr = isP2p ? getRandomPeerId() : `CDN (${cdnUrl})`;

      setChunks((prev) =>
        prev.map((chunk) =>
          chunk.id === chunkId
            ? {
                ...chunk,
                status,
                source: sourceStr,
                downloadedAt: new Date(),
                speed: 5 + Math.random() * 10,
              }
            : chunk
        )
      );

      // Update totals
      const chunkSize = chunks[chunkId]?.size || 2.5;
      setTotalDownloaded((prev) => prev + chunkSize);
      if (isP2p) {
        setP2pDownloaded((prev) => prev + chunkSize);
      } else {
        setCdnDownloaded((prev) => prev + chunkSize);
      }
    }, downloadTime);
  }, [p2pEnabled, peerCount, chunks, getRandomPeerId, cdnUrl]);

  // Initial CDN chunks
  useEffect(() => {
    const timer = setTimeout(() => {
      setChunks((prev) =>
        prev.map((chunk, i) =>
          i < 5
            ? {
                ...chunk,
                status: 'cdn',
                source: `CDN (${cdnUrl})`,
                downloadedAt: new Date(),
                speed: 8 + Math.random() * 4,
              }
            : chunk
        )
      );
      setCdnDownloaded((prev) => prev + 5 * 2.5);
      setTotalDownloaded((prev) => prev + 5 * 2.5);
    }, 2000);

    return () => clearTimeout(timer);
  }, [cdnUrl]);

  // Continuous downloading simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setChunks((prev) => {
        const pendingChunks = prev.filter(
          (c) => c.status === 'pending' && !downloadingRef.current.has(c.id)
        );
        const downloadingCount = downloadingRef.current.size;

        if (downloadingCount < 5 && pendingChunks.length > 0) {
          const numToStart = Math.min(
            Math.floor(2 + Math.random() * 3),
            5 - downloadingCount,
            pendingChunks.length
          );

          for (let i = 0; i < numToStart; i++) {
            markChunkDownloading(pendingChunks[i].id);
          }
        }

        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [markChunkDownloading]);

  const updateCurrentChunk = useCallback((currentTime: number, duration: number) => {
    if (duration > 0) {
      const chunkIndex = Math.floor((currentTime / duration) * TOTAL_CHUNKS);
      setCurrentChunk(Math.min(chunkIndex, TOTAL_CHUNKS - 1));

      setChunks((prev) =>
        prev.map((chunk, i) => {
          if (i === chunkIndex && (chunk.status === 'p2p' || chunk.status === 'cdn')) {
            return { ...chunk, status: 'playing' };
          }
          if (i !== chunkIndex && chunk.status === 'playing') {
            return { ...chunk, status: chunk.source?.includes('CDN') ? 'cdn' : 'p2p' };
          }
          return chunk;
        })
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const baseSpeed = p2pEnabled && peerCount > 0 ? 8 + peerCount * 0.5 : 4;
      const noise = (Math.random() - 0.5) * 4;
      const newSpeed = Math.max(0, baseSpeed + noise);

      setDownloadSpeed(newSpeed);
      setSpeedHistory((prev) => [...prev.slice(1), newSpeed]);
    }, 500);

    return () => clearInterval(interval);
  }, [p2pEnabled, peerCount]);

  const downloadedCount = chunks.filter(
    (c) => c.status === 'p2p' || c.status === 'cdn' || c.status === 'playing'
  ).length;

  const downloadingCount = chunks.filter((c) => c.status === 'downloading').length;
  const p2pRatio = totalDownloaded > 0 ? (p2pDownloaded / totalDownloaded) * 100 : 0;

  return {
    chunks,
    currentChunk,
    downloadSpeed,
    speedHistory,
    totalDownloaded,
    p2pDownloaded,
    cdnDownloaded,
    downloadedCount,
    downloadingCount,
    totalChunks: TOTAL_CHUNKS,
    p2pRatio,
    updateCurrentChunk,
  };
};
