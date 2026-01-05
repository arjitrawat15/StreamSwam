import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Clock, Upload, Search, Calendar, Film, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { videoService, Video } from '@/services/api';
import UploadModal from '@/components/modals/UploadModal';
import { usePeerSimulation } from '@/hooks/usePeerSimulation';
import { useNotifications } from '@/hooks/useNotifications';

const Library = () => {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { peerCount, connectionStatus } = usePeerSimulation();
    const { notifications, markAsRead, clearAll } = useNotifications();

    const { data: videos, isLoading, refetch } = useQuery({
        queryKey: ['videos'],
        queryFn: videoService.getVideos,
        refetchInterval: 5000,
    });

    const filteredVideos = videos?.filter(v =>
        v.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDelete = async (e: React.MouseEvent, videoId: string) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

        if (confirm('Are you sure you want to delete this video?')) {
            try {
                await videoService.deleteVideo(videoId);
                refetch();
            } catch (error) {
                console.error('Failed to delete video:', error);
                alert('Failed to delete video');
            }
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <Header
                peerCount={peerCount}
                connectionStatus={connectionStatus}
                notifications={notifications}
                onNotificationRead={markAsRead}
                onClearNotifications={clearAll}
                // Mock handlers for header actions as they aren't main focus here
                onSettingsClick={() => { }}
                onPeerClick={() => { }}
                onProfileClick={() => { }}
                onStatsClick={() => { }}
                onHistoryClick={() => { }}
            />

            <main className="container mx-auto px-4 pt-28 pb-12 relative z-10">
                {/* Page Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Library</h1>
                        <p className="text-muted-foreground text-lg">
                            Watch and manage your decentralized video content
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted/50 border border-border/50 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Video
                        </button>
                    </div>
                </div>

                {/* Video Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-video bg-muted/30 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredVideos.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredVideos.map((video) => (
                            <motion.div key={video.video_id} variants={item}>
                                <Link
                                    to={`/watch?v=${video.video_id}`}
                                    className="group block bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                                >
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        {/* Placeholder Thumbnail Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="w-5 h-5 text-primary-foreground ml-1" fill="currentColor" />
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${video.status === 'ready' ? 'bg-success/20 text-success' :
                                                video.status === 'processing' ? 'bg-warning/20 text-warning' :
                                                    'bg-destructive/20 text-destructive'
                                                }`}>
                                                {video.status}
                                            </span>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(e, video.video_id)}
                                            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
                                            title="Delete video"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                {video.original_name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Unknown date'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Film className="w-3.5 h-3.5" />
                                                <span>{video.total_chunks} chunks</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <Film className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                        <p className="mb-6">Upload a video to get started with streaming.</p>
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
                        >
                            Upload Video
                        </button>
                    </div>
                )}
            </main>

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadComplete={() => refetch()}
            />
        </div>
    );
};

export default Library;
