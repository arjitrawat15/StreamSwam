import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Video {
    video_id: string;
    original_name: string;
    status: 'processing' | 'ready' | 'failed' | 'uploaded';
    total_chunks: number;
    created_at?: string;
    manifest_url?: string;
}

export interface Chunk {
    id: number;
    filename: string;
    hash: string;
    size: number;
    url: string;
}

export interface Manifest {
    video_id: string;
    total_chunks: number;
    chunk_duration: number;
    init_segment?: string;
    chunks: Chunk[];
}

export interface UploadResponse {
    video_id: string;
    message: string;
    status: string;
}

export const videoService = {
    uploadVideo: async (file: File, onProgress?: (progress: number) => void) => {
        const formData = new FormData();
        formData.append('video', file);

        const response = await api.post<UploadResponse>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    },

    deleteVideo: async (videoId: string) => {
        const response = await api.delete<{ message: string }>(`/video/${videoId}`);
        return response.data;
    },

    getVideos: async () => {
        const response = await api.get<{ videos: Video[] }>('/videos');
        return response.data.videos;
    },

    getVideo: async (videoId: string) => {
        const response = await api.get<Video>(`/video/${videoId}`);
        return response.data;
    },

    getManifest: async (videoId: string) => {
        const response = await api.get<Manifest>(`/manifest/${videoId}`);
        return response.data;
    },

    getVideoStreamUrl: (videoId: string) => {
        return `${API_URL}/stream/${videoId}`;
    }
};
