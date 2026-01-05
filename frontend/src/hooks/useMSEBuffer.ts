import { useState, useEffect, useRef } from 'react';
import { Manifest } from '@/services/api';
import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8080';

export const useMSEBuffer = (
    manifest: Manifest | undefined
) => {
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const queueRef = useRef<ArrayBuffer[]>([]);
    const [initLoaded, setInitLoaded] = useState(false);
    const loadedChunks = useRef<Set<number>>(new Set());
    const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);
    const isEndedRef = useRef(false);

    const handleSourceOpen = () => {
        console.log("MSE: SourceOpen event");
        if (!mediaSourceRef.current || !manifest) return;

        // For HLS/fMP4 created by ffmpeg with libx264 (High 4.0) and aac:
        const mimeType = 'video/mp4; codecs="avc1.640028,mp4a.40.2"';

        console.log(`MSE: Attempting to add SourceBuffer with type: ${mimeType} `);

        if (MediaSource.isTypeSupported(mimeType)) {
            if (mediaSourceRef.current.sourceBuffers.length > 0) return; // Already exists

            try {
                const sourceBuffer = mediaSourceRef.current.addSourceBuffer(mimeType);
                // Use sequence mode to ignore internal timestamps and stitch strictly by append order
                sourceBuffer.mode = 'sequence';
                sourceBufferRef.current = sourceBuffer;

                sourceBuffer.addEventListener('updateend', () => {
                    processQueue();
                });
                sourceBuffer.addEventListener('error', (e) => console.error("MSE SourceBuffer Error:", e));

                console.log("MSE: SourceBuffer created successfully in sequence mode");
                loadInitSegment();
            } catch (e) {
                console.error("MSE: Error creating SourceBuffer:", e);
            }
        } else {
            console.error("MSE: MIME type not supported:", mimeType);
        }
    };

    const loadInitSegment = async () => {
        if (!manifest?.init_segment) return;
        console.log("MSE: Loading init segment...");
        try {
            const response = await axios.get(`${API_BASE_URL}${manifest.init_segment}`, {
                responseType: 'arraybuffer'
            });
            console.log("MSE: Init segment loaded");
            addToQueue(response.data);
            setInitLoaded(true);
        } catch (e) {
            console.error("MSE: Failed to load init segment", e);
        }
    };

    const addToQueue = (data: ArrayBuffer) => {
        queueRef.current.push(data);
        processQueue();
    };

    const processQueue = () => {
        if (!sourceBufferRef.current || sourceBufferRef.current.updating || queueRef.current.length === 0) return;

        const data = queueRef.current.shift();
        if (!data) return;

        try {
            sourceBufferRef.current.appendBuffer(data);
        } catch (e) {
            console.error("Error appending buffer:", e);
        }
    };

    // Check if we are done and close stream
    const checkEndOfStream = () => {
        if (!manifest || !mediaSourceRef.current || isEndedRef.current) return;

        // If all chunks are loaded AND queue is empty AND sourceBuffer is not updating
        if (loadedChunks.current.size === manifest.total_chunks &&
            queueRef.current.length === 0 &&
            (!sourceBufferRef.current || !sourceBufferRef.current.updating)) {

            if (mediaSourceRef.current.readyState === 'open') {
                try {
                    console.log("MSE: All chunks loaded. Calling endOfStream()");
                    mediaSourceRef.current.endOfStream();
                    isEndedRef.current = true;
                } catch (e) {
                    console.error("Error calling endOfStream:", e);
                }
            }
        }
    };

    // Initialize MediaSource
    useEffect(() => {
        if (!manifest || !window.MediaSource) return;

        console.log("MSE: Initializing MediaSource...");
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        isEndedRef.current = false;
        loadedChunks.current.clear();
        setInitLoaded(false);

        const url = URL.createObjectURL(mediaSource);
        setObjectUrl(url);

        mediaSource.addEventListener('sourceopen', handleSourceOpen);

        return () => {
            URL.revokeObjectURL(url);
            if (mediaSource.readyState === 'open') {
                try {
                    mediaSource.endOfStream();
                } catch (e) { console.error(e); }
            }
        };
    }, [manifest]);

    // Load chunks strictly sequentially
    useEffect(() => {
        if (!initLoaded || !manifest) return;

        const loadChunksSequentially = async () => {
            console.log("MSE: Starting sequential chunk load...");

            // Sort chunks by ID just in case
            const sortedChunks = [...manifest.chunks].sort((a, b) => a.id - b.id);

            for (const chunk of sortedChunks) {
                if (loadedChunks.current.has(chunk.id)) continue;

                try {
                    console.log(`MSE: Fetching chunk ${chunk.id}...`);
                    const response = await axios.get(`${API_BASE_URL}${chunk.url}`, {
                        responseType: 'arraybuffer'
                    });

                    // Wait for queue to drain to avoid memory issues
                    while (queueRef.current.length > 5) {
                        await new Promise(r => setTimeout(r, 100));
                    }

                    addToQueue(response.data);
                    loadedChunks.current.add(chunk.id);
                    console.log(`MSE: Appended chunk ${chunk.id}`);
                } catch (e) {
                    console.error(`Failed to load chunk ${chunk.id}`, e);
                    // Decide if we should abort or continue
                }
            }

            // Try to close stream after loop
            setTimeout(checkEndOfStream, 1000);
        };

        loadChunksSequentially();
    }, [initLoaded, manifest]);

    // Also attach checkEndOfStream to updateend
    useEffect(() => {
        const interval = setInterval(checkEndOfStream, 500);
        return () => clearInterval(interval);
    }, [manifest]);

    return {
        initLoaded,
        objectUrl
    };
};
