import { useState, useEffect, useCallback, RefObject } from 'react';
import { Manifest } from '@/services/api';

export type ChunkStatus = 'pending' | 'downloading' | 'p2p' | 'cdn' | 'playing' | 'failed';

export interface Chunk {
    id: number;
    status: ChunkStatus;
    size: number;
    source?: string;
    downloadedAt?: Date;
    speed?: number;
    filename?: string;
}

export const useRealChunks = (
    manifest: Manifest | undefined,
    videoRef: RefObject<HTMLVideoElement>,
    p2pEnabled: boolean
) => {
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [downloadSpeed, setDownloadSpeed] = useState(0);
    const [speedHistory, setSpeedHistory] = useState<number[]>(Array(120).fill(0));

    // Initialize chunks from manifest
    useEffect(() => {
        if (manifest && manifest.chunks) {
            setChunks(manifest.chunks.map(c => ({
                id: c.id,
                status: 'pending',
                size: c.size / (1024 * 1024), // Convert to MB for display
                filename: c.filename,
                source: 'pending'
            })));
        }
    }, [manifest]);

    // Polling for buffer status
    useEffect(() => {
        if (!videoRef.current || !manifest) return;

        const interval = setInterval(() => {
            const video = videoRef.current;
            if (!video) return;

            const buffered = video.buffered;
            const duration = video.duration;
            const currentTime = video.currentTime;

            if (!duration) return;

            setChunks(prevChunks => prevChunks.map(chunk => {
                // Calculate chunk time range
                const chunkDuration = manifest.chunk_duration || 5;
                const startTime = chunk.id * chunkDuration;
                const endTime = (chunk.id + 1) * chunkDuration;

                // Determine if chunk is buffered
                let isBuffered = false;
                for (let i = 0; i < buffered.length; i++) {
                    if (buffered.start(i) <= startTime && buffered.end(i) >= Math.min(endTime, duration)) {
                        isBuffered = true;
                        break;
                    }
                }

                // Determine if chunk is currently playing
                const isPlaying = currentTime >= startTime && currentTime < endTime;

                let status: ChunkStatus = chunk.status;

                if (isPlaying) {
                    status = 'playing';
                } else if (isBuffered) {
                    // If buffered and not already marked as downloaded, mark as CDN (since we are using direct stream)
                    if (status === 'pending' || status === 'downloading') {
                        status = 'cdn';
                    }
                } else {
                    // Reset to pending if dropped from buffer (e.g. seeking away)
                    if (status !== 'pending' && status !== 'failed') {
                        // status = 'pending'; // Optional: keep as downloaded if we want history
                    }
                }

                return {
                    ...chunk,
                    status,
                    source: status === 'cdn' ? 'CDN' : (status === 'p2p' ? 'P2P' : chunk.source)
                };
            }));

            // Estimate speed (simulated for now based on buffer growth, or just random noise if playing)
            // Real speed calculation is hard without intercepting network requests
            setDownloadSpeed(isBuffering(video) ? 0 : (Math.random() * 5 + 5));

        }, 500);

        return () => clearInterval(interval);
    }, [manifest, videoRef]);

    // Helper to check buffering
    const isBuffering = (video: HTMLVideoElement) => {
        return video.readyState < 3;
    };

    const updateCurrentChunk = useCallback((currentTime: number, duration: number) => {
        // Handled in polling loop for better accuracy with buffer
    }, []);

    // Derived stats
    const totalChunks = chunks.length;
    const downloadedCount = chunks.filter(c => c.status === 'cdn' || c.status === 'p2p' || c.status === 'playing').length;
    const downloadingCount = 0; // standard HTML5 video doesn't expose 'downloading' chunks easily
    const totalDownloaded = chunks.filter(c => c.status !== 'pending').reduce((acc, c) => acc + c.size, 0);
    const p2pDownloaded = chunks.filter(c => c.status === 'p2p').reduce((acc, c) => acc + c.size, 0); // Will be 0 for now
    const cdnDownloaded = chunks.filter(c => c.status === 'cdn').reduce((acc, c) => acc + c.size, 0);
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
        totalChunks,
        p2pRatio,
        updateCurrentChunk
    };
};
