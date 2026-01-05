import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Film, HardDrive, Users, Upload } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  p2pDownloaded: number;
  peerCount: number;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, p2pDownloaded, peerCount }) => {
  const stats = [
    {
      icon: Clock,
      label: 'Total Watch Time',
      value: '24h 35m',
      gradient: 'from-primary to-secondary',
    },
    {
      icon: Film,
      label: 'Videos Watched',
      value: '156',
      gradient: 'from-secondary to-accent',
    },
    {
      icon: HardDrive,
      label: 'Bandwidth Saved',
      value: `${(p2pDownloaded / 1024).toFixed(1)} GB`,
      gradient: 'from-success to-cyber',
    },
    {
      icon: Users,
      label: 'Peers Helped',
      value: '47',
      gradient: 'from-warning to-accent',
    },
    {
      icon: Upload,
      label: 'Avg Upload Speed',
      value: '3.2 MB/s',
      gradient: 'from-info to-primary',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                     w-full max-w-lg"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Stats</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient}
                                   flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-background" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold font-mono-stats">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/30">
                <p className="text-sm text-success">
                  🎉 You're in the top 10% of contributors this month!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;
