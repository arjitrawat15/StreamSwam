import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle, FileVideo, } from 'lucide-react';
import { videoService } from '@/services/api';
import { useToasts } from '@/components/Toast/ToastProvider';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToasts();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska', 'video/quicktime', 'video/x-flv', 'video/x-ms-wmv'];
        // Simple extension check as fallback
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExts = ['mp4', 'mkv', 'avi', 'mov', 'flv', 'wmv'];

        if (validTypes.includes(file.type) || (ext && validExts.includes(ext))) {
            setFile(file);
            setError(null);
        } else {
            setError('Please upload a valid video file (MP4, MKV, AVI, MOV)');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            await videoService.uploadVideo(file, (percent) => {
                setProgress(percent);
            });

            addToast('success', 'Video uploaded successfully! Processing started.');
            if (onUploadComplete) onUploadComplete();

            // Reset and close after a brief delay
            setTimeout(() => {
                setFile(null);
                setUploading(false);
                setProgress(0);
                onClose();
            }, 1500);

        } catch (err) {
            console.error(err);
            setError('Upload failed. Please try again.');
            setUploading(false);
            addToast('error', 'Failed to upload video');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">Upload Video</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                    disabled={uploading}
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {!file ? (
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => inputRef.current?.click()}
                                        className={`
                      border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center
                      transition-colors cursor-pointer text-center
                      ${dragActive
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                    `}
                                    >
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".mp4,.mkv,.avi,.mov,.flv,.wmv"
                                            onChange={handleChange}
                                        />
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                                        <p className="text-sm text-muted-foreground">
                                            MP4, MKV, AVI, MOV up to 2GB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileVideo className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                            {!uploading && (
                                                <button
                                                    onClick={() => setFile(null)}
                                                    className="p-2 hover:bg-background rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>

                                        {uploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Uploading...</span>
                                                    <span className="font-medium">{progress}%</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ ease: "linear" }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                                <button
                                    onClick={onClose}
                                    disabled={uploading}
                                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium 
                           hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>Creating...</>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Upload Video
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UploadModal;
