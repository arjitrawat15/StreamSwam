import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  watchedAt: Date;
  progress: number;
  duration: string;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg',
    watchedAt: new Date(Date.now() - 1000 * 60 * 30),
    progress: 75,
    duration: '9:56',
  },
  {
    id: '2',
    title: 'Sintel',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Sintel-poster.jpg/220px-Sintel-poster.jpg',
    watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    progress: 100,
    duration: '14:48',
  },
  {
    id: '3',
    title: 'Tears of Steel',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tears_of_Steel_poster.jpg/220px-Tears_of_Steel_poster.jpg',
    watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    progress: 45,
    duration: '12:14',
  },
];

const formatTimeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
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
            <div className="glass-card p-6 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Watch History</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1">
                {mockHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-3 rounded-xl bg-muted/20 border border-border/30
                             hover:border-primary/30 cursor-pointer transition-all duration-300 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100
                                    flex items-center justify-center transition-opacity">
                        <Play className="w-8 h-8 text-foreground" fill="currentColor" />
                      </div>
                      {/* Duration badge */}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-background/80 text-xs">
                        {item.duration}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(item.watchedAt)}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.progress === 100 ? 'bg-success' : 'bg-primary'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {mockHistory.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No watch history yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryModal;
