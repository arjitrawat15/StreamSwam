import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chunk } from '@/hooks/useChunkSimulation';

interface ChunkGridProps {
  chunks: Chunk[];
  isExpanded: boolean;
}

const ChunkGrid: React.FC<ChunkGridProps> = ({ chunks, isExpanded }) => {
  const getChunkColor = (status: Chunk['status']) => {
    switch (status) {
      case 'p2p':
        return 'bg-success/20 border-success';
      case 'cdn':
        return 'bg-warning/20 border-warning';
      case 'downloading':
        return 'bg-info/20 border-info';
      case 'playing':
        return 'bg-foreground/30 border-foreground';
      case 'failed':
        return 'bg-destructive/20 border-destructive';
      default:
        return 'bg-muted/10 border-muted/30';
    }
  };

  const getChunkGlow = (status: Chunk['status']) => {
    switch (status) {
      case 'p2p':
        return 'shadow-glow-green';
      case 'playing':
        return 'shadow-glow';
      case 'downloading':
        return '';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: Chunk['status']) => {
    switch (status) {
      case 'p2p':
      case 'cdn':
        return '✓';
      case 'playing':
        return '▶';
      case 'failed':
        return '✕';
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[1400px] mx-auto mt-8 overflow-hidden"
        >
          <div className="glass-card p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Chunk Download Map</h3>
                <p className="text-sm text-muted-foreground">
                  {chunks.length} total chunks •{' '}
                  {chunks.filter((c) => c.status === 'p2p' || c.status === 'cdn' || c.status === 'playing').length} downloaded •{' '}
                  {chunks.filter((c) => c.status === 'pending').length} remaining
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted/30 border border-muted/50" />
                  <span className="text-muted-foreground">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-info/30 border border-info animate-pulse" />
                  <span className="text-muted-foreground">Downloading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success/30 border border-success" />
                  <span className="text-muted-foreground">P2P</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning/30 border border-warning" />
                  <span className="text-muted-foreground">CDN</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-foreground/30 border border-foreground" />
                  <span className="text-muted-foreground">Playing</span>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-10 sm:grid-cols-15 gap-2">
              {chunks.map((chunk, index) => (
                <motion.div
                  key={chunk.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.003,
                    duration: 0.2,
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  className={`aspect-square rounded-lg border flex items-center justify-center
                           text-xs font-medium transition-all duration-300 cursor-pointer
                           ${getChunkColor(chunk.status)} ${getChunkGlow(chunk.status)}
                           ${chunk.status === 'downloading' ? 'animate-pulse' : ''}`}
                  title={`Chunk #${chunk.id + 1} - ${chunk.status.toUpperCase()}${
                    chunk.source ? ` from ${chunk.source}` : ''
                  }`}
                >
                  {getStatusIcon(chunk.status)}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChunkGrid;
