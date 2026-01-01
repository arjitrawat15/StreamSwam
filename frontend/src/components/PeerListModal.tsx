import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Download, Upload, Clock } from 'lucide-react';
import { Peer } from '@/hooks/usePeerSimulation';

interface PeerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: Peer[];
}

const PeerListModal: React.FC<PeerListModalProps> = ({ isOpen, onClose, peers }) => {
  const formatDuration = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-card p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Connected Peers</h2>
                <p className="text-sm text-muted-foreground">
                  {peers.length} peer{peers.length !== 1 ? 's' : ''} in your swarm
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Peer List */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {peers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No peers connected</p>
                  <p className="text-sm">Waiting for peers to join...</p>
                </div>
              ) : (
                peers.map((peer, index) => (
                  <motion.div
                    key={peer.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50
                             transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={peer.avatar}
                        alt={peer.id}
                        className="w-10 h-10 rounded-full border-2 border-primary/30"
                      />
                      <div className="flex-1">
                        <p className="font-mono text-sm font-medium">{peer.id}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{peer.flag}</span>
                          <MapPin className="w-3 h-3" />
                          <span>{peer.location}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(peer.connectedAt)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-success">
                        <Download className="w-3 h-3" />
                        <span className="font-mono">{peer.downloadSpeed.toFixed(1)} MB/s</span>
                      </div>
                      <div className="flex items-center gap-1 text-info">
                        <Upload className="w-3 h-3" />
                        <span className="font-mono">{peer.uploadSpeed.toFixed(1)} MB/s</span>
                      </div>
                      <div className="text-muted-foreground text-right">
                        <span className="font-mono">{peer.latency.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PeerListModal;
