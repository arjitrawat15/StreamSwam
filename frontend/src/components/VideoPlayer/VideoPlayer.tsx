import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  Zap,
  Download,
} from 'lucide-react';
import { Chunk } from '@/hooks/useChunkSimulation';
import QualityDropdown from '@/components/dropdowns/QualityDropdown';

interface VideoPlayerProps {
  onTimeUpdate: (currentTime: number, duration: number) => void;
  chunks: Chunk[];
  p2pEnabled: boolean;
  onToggleP2p: () => void;
  downloadSpeed: number;
  downloadingCount: number;
  downloadedCount: number;
  totalChunks: number;
  quality: string;
  onQualityChange: (quality: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  onTimeUpdate,
  chunks,
  p2pEnabled,
  onToggleP2p,
  downloadSpeed,
  downloadingCount,
  downloadedCount,
  totalChunks,
  quality,
  onQualityChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [qualityOpen, setQualityOpen] = useState(false);

  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  // Control visibility
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [isPlaying, resetHideTimer]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(time);
      onTimeUpdate(time, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleWaiting = () => setIsBuffering(true);
  const handlePlaying = () => setIsBuffering(false);

  // Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setHoverTime(percent * duration);
      setHoverPosition(e.clientX - rect.left);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = isMuted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // Calculate chunk positions for progress bar
  const getChunkMarkers = () => {
    return chunks.map((chunk, index) => {
      const position = (index / totalChunks) * 100;
      let color = 'bg-muted/30';
      if (chunk.status === 'p2p') color = 'bg-success';
      else if (chunk.status === 'cdn') color = 'bg-warning';
      else if (chunk.status === 'downloading') color = 'bg-info animate-pulse';
      else if (chunk.status === 'failed') color = 'bg-destructive';
      else if (chunk.status === 'playing') color = 'bg-foreground';

      return (
        <motion.div
          key={chunk.id}
          className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${color}`}
          style={{ left: `${position}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.01, duration: 0.2 }}
        />
      );
    });
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative w-full max-w-[1600px] mx-auto aspect-video rounded-3xl overflow-hidden
               bg-background shadow-elevation group"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        className="w-full h-full object-contain bg-background"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onClick={togglePlay}
      />

      {/* Buffering Spinner */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/50"
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="mt-4 text-sm text-muted-foreground">Buffering...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button */}
      <AnimatePresence>
        {!isPlaying && !isBuffering && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 rounded-full glass flex items-center justify-center
                       border border-border/50 hover:border-primary/50 transition-colors"
            >
              <Play className="w-10 h-10 text-foreground ml-1" fill="currentColor" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent"
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="relative h-2 mx-6 mb-2 cursor-pointer group/progress"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* Background Track */}
              <div className="absolute inset-0 rounded-full bg-muted/30" />

              {/* Chunk Markers */}
              <div className="absolute inset-0">{getChunkMarkers()}</div>

              {/* Progress Fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full progress-gradient"
                style={{ width: `${progress}%` }}
              />

              {/* Scrubber */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground
                         shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 8px)` }}
              />

              {/* Time Tooltip */}
              <AnimatePresence>
                {hoverTime !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-10 px-2 py-1 rounded bg-card text-xs font-mono"
                    style={{ left: hoverPosition - 20 }}
                  >
                    {formatTime(hoverTime)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between px-6 pb-6">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full flex items-center justify-center
                           hover:bg-muted/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                  )}
                </motion.button>

                {/* Volume */}
                <div className="flex items-center gap-2 group/volume">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    className="p-2 hover:bg-muted/30 rounded-full transition-colors"
                  >
                    <VolumeIcon className="w-5 h-5" />
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/volume:w-24 transition-all duration-300
                             accent-primary cursor-pointer"
                  />
                </div>

                {/* Time */}
                <span className="font-mono text-sm text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {/* Quality Badge */}
                <div className="relative">
                  <button onClick={() => setQualityOpen(!qualityOpen)}
                    className="px-3 py-1.5 rounded-lg bg-muted/30 text-xs font-medium hover:bg-muted/50 transition-colors">
                    {quality === 'auto' ? 'Auto' : quality} HD
                  </button>
                  <QualityDropdown isOpen={qualityOpen} onClose={() => setQualityOpen(false)} quality={quality} onQualityChange={onQualityChange} />
                </div>

                {/* P2P Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleP2p}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                           transition-all duration-300 ${
                             p2pEnabled
                               ? 'bg-cyber/20 text-cyber border border-cyber/30'
                               : 'bg-muted/30 text-muted-foreground border border-transparent'
                           }`}
                >
                  <Zap className={`w-4 h-4 ${p2pEnabled ? 'animate-pulse' : ''}`} />
                  P2P
                </motion.button>

                {/* Settings */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 hover:bg-muted/30 rounded-full transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>

                {/* Fullscreen */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-muted/30 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Indicator */}
      <AnimatePresence>
        {downloadingCount > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="absolute bottom-24 right-4 glass-card px-4 py-3 flex items-center gap-3"
          >
            <Download className="w-4 h-4 text-info animate-bounce" />
            <div>
              <p className="text-xs text-muted-foreground">Downloading</p>
              <p className="text-sm font-mono font-medium">
                Chunk {downloadedCount}/{totalChunks}
              </p>
            </div>
            <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-info"
                initial={{ width: 0 }}
                animate={{ width: `${(downloadedCount / totalChunks) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoPlayer;
