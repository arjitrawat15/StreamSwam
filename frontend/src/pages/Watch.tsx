import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import MetricsDashboard from '@/components/MetricsDashboard/MetricsDashboard';
import ChunkGrid from '@/components/ChunkVisualizer/ChunkGrid';
import SettingsModal from '@/components/SettingsModal';
import ShortcutsModal from '@/components/ShortcutsModal';
import PeerListModal from '@/components/PeerListModal';
import ProfileModal from '@/components/modals/ProfileModal';
import StatsModal from '@/components/modals/StatsModal';
import HistoryModal from '@/components/modals/HistoryModal';
import { ToastContainer, useToasts } from '@/components/Toast/ToastProvider';
import { usePeerSimulation } from '@/hooks/usePeerSimulation';
import { useChunkDownloader } from '@/hooks/useChunkDownloader';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotifications } from '@/hooks/useNotifications';

const Watch = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPeerListOpen, setIsPeerListOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChunkGridExpanded, setIsChunkGridExpanded] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const videoRef = useRef<HTMLVideoElement>(null);

  const { toasts, addToast, removeToast } = useToasts();
  const { notifications, markAsRead, clearAll, addNotification } = useNotifications();

  const {
    peers,
    peerCount,
    connectionStatus,
    p2pEnabled,
    toggleP2p,
  } = usePeerSimulation();

  const videoId = new URLSearchParams(window.location.search).get('v') || 'demo-video';

  const { 
    chunks, 
    stats, 
    manifest, 
    error, 
    isLoading 
  } = useChunkDownloader(videoId);

  // Dummy empty callback to replace old `updateCurrentChunk`
  const updateCurrentChunk = useCallback((currentTime: number, duration: number) => {}, []);

  // Speed history mock for chart (since useChunkDownloader doesn't export the history array)
  // We can just build a pseudo-history using stats.currentSpeedMbps or pass an empty array
  const [speedHistory, setSpeedHistory] = useState<number[]>(Array(120).fill(0));
  React.useEffect(() => {
    setSpeedHistory(prev => [...prev.slice(1), stats.currentSpeedMbps]);
  }, [stats.currentSpeedMbps]);

  // Add notification when peer count changes
  React.useEffect(() => {
    if (peerCount > 0 && connectionStatus === 'connected') {
      addNotification('peer', `Connected to ${peerCount} peer${peerCount > 1 ? 's' : ''}`);
      addToast('success', `Connected to ${peerCount} peer${peerCount > 1 ? 's' : ''}`);
    }
  }, [connectionStatus]);

  const handleToggleP2p = useCallback(() => {
    toggleP2p();
    const message = p2pEnabled ? 'P2P disabled, using CDN only' : 'P2P enabled, connecting to swarm...';
    addToast(p2pEnabled ? 'warning' : 'success', message);
    addNotification('system', message);
  }, [p2pEnabled, toggleP2p, addToast, addNotification]);

  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality);
    addToast('info', `Quality changed to ${newQuality}`);
    addNotification('quality', `Video quality changed to ${newQuality}`);
  }, [addToast, addNotification]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: () => {},
    onSeekForward: () => {},
    onSeekBackward: () => {},
    onVolumeUp: () => {},
    onVolumeDown: () => {},
    onMute: () => {},
    onFullscreen: () => {},
    onToggleChunkGrid: () => setIsChunkGridExpanded((prev) => !prev),
    onShowShortcuts: () => setIsShortcutsOpen(true),
    onSeekToPercent: () => {},
  });

  return (
    <div className="min-h-screen bg-background bg-cyber-grid bg-grid">
      {/* Header */}
      <Header
        peerCount={peerCount}
        connectionStatus={connectionStatus}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onPeerClick={() => setIsPeerListOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onStatsClick={() => setIsStatsOpen(true)}
        onHistoryClick={() => setIsHistoryOpen(true)}
        notifications={notifications}
        onNotificationRead={markAsRead}
        onClearNotifications={clearAll}
      />

      {/* Back to Home Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-24 left-6 z-40"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground
                   hover:text-foreground hover:border-primary/30 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-4">
        {/* Video Player */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 relative"
        >
          {isLoading && (
            <div className="absolute top-4 left-4 z-50 px-3 py-1 bg-black/50 text-white rounded text-sm glass">
              Connecting to swarm...
            </div>
          )}
          {error && (
            <div className="absolute top-4 left-4 z-50 px-3 py-1 bg-destructive/80 text-white rounded text-sm glass">
              ⚠ {error}
            </div>
          )}
          <VideoPlayer
            onTimeUpdate={updateCurrentChunk}
            chunks={chunks}
            p2pEnabled={p2pEnabled}
            onToggleP2p={handleToggleP2p}
            downloadSpeed={stats.currentSpeedMbps}
            downloadingCount={chunks.filter(c => c.status === 'active').length}
            downloadedCount={stats.downloaded}
            totalChunks={stats.totalChunks || 150}
            quality={quality}
            onQualityChange={handleQualityChange}
          />
        </motion.section>

        {/* Metrics Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <MetricsDashboard
            peers={peers}
            peerCount={peerCount}
            downloadSpeed={stats.currentSpeedMbps}
            speedHistory={speedHistory}
            totalDownloaded={stats.downloaded}
            p2pDownloaded={stats.fromPeers}
            cdnDownloaded={stats.fromCDN}
            p2pRatio={stats.downloaded > 0 ? (stats.fromPeers / stats.downloaded) * 100 : 0}
            chunks={chunks}
            downloadedCount={stats.downloaded}
            totalChunks={stats.totalChunks || 150}
            isChunkGridExpanded={isChunkGridExpanded}
            onToggleChunkGrid={() => setIsChunkGridExpanded((prev) => !prev)}
          />
        </motion.section>

        {/* Chunk Grid */}
        <ChunkGrid 
          chunks={chunks} 
          stats={stats} 
          totalChunks={stats.totalChunks || 150} 
          isExpanded={isChunkGridExpanded} 
        />
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        p2pEnabled={p2pEnabled}
        onToggleP2p={handleToggleP2p}
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <PeerListModal
        isOpen={isPeerListOpen}
        onClose={() => setIsPeerListOpen(false)}
        peers={peers}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        p2pDownloaded={stats.fromPeers}
        peerCount={peerCount}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-4 left-4 text-xs text-muted-foreground"
      >
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted">?</kbd> for shortcuts
      </motion.div>

      {/* Debug Overlay (Dev Only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-white/80 w-80 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
            <span className="font-bold text-white">StreamSwarm Debug</span>
            <span className={connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
              {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Last Chunk:</span>
              <span className="text-cyan-300">
                {chunks.slice().reverse().find(c => c.status === 'done' || c.status === 'from_peer')
                  ? `Chunk #${chunks.slice().reverse().find(c => c.status === 'done' || c.status === 'from_peer')?.id}`
                  : 'Waiting...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Source:</span>
              <span>
                {chunks.slice().reverse().find(c => c.status === 'done' || c.status === 'from_peer')?.source?.toUpperCase() || 'N/A'} 
                {' | '} 
                {stats.currentSpeedMbps || 0} MB/s
              </span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
              <span>Active Downloads:</span>
              <span className="text-yellow-400">{chunks.filter(c => c.status === 'active').length} in flight</span>
            </div>
            <div className="flex justify-between">
              <span>Queue Remaining:</span>
              <span>{chunks.filter(c => c.status === 'pending').length} pending</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;
