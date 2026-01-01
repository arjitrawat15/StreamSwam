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
import { useChunkSimulation } from '@/hooks/useChunkSimulation';
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

  const {
    chunks,
    downloadSpeed,
    speedHistory,
    totalDownloaded,
    p2pDownloaded,
    cdnDownloaded,
    downloadedCount,
    downloadingCount,
    totalChunks,
    p2pRatio,
    updateCurrentChunk,
  } = useChunkSimulation(p2pEnabled, peerCount);

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
          className="mb-12"
        >
          <VideoPlayer
            onTimeUpdate={updateCurrentChunk}
            chunks={chunks}
            p2pEnabled={p2pEnabled}
            onToggleP2p={handleToggleP2p}
            downloadSpeed={downloadSpeed}
            downloadingCount={downloadingCount}
            downloadedCount={downloadedCount}
            totalChunks={totalChunks}
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
            downloadSpeed={downloadSpeed}
            speedHistory={speedHistory}
            totalDownloaded={totalDownloaded}
            p2pDownloaded={p2pDownloaded}
            cdnDownloaded={cdnDownloaded}
            p2pRatio={p2pRatio}
            chunks={chunks}
            downloadedCount={downloadedCount}
            totalChunks={totalChunks}
            isChunkGridExpanded={isChunkGridExpanded}
            onToggleChunkGrid={() => setIsChunkGridExpanded((prev) => !prev)}
          />
        </motion.section>

        {/* Chunk Grid */}
        <ChunkGrid chunks={chunks} isExpanded={isChunkGridExpanded} />
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
        p2pDownloaded={p2pDownloaded}
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
    </div>
  );
};

export default Watch;
