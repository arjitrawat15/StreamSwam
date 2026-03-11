import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';
import { ChunkState } from '@/services/ChunkDownloader';

interface ChunkToggleCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  chunks: ChunkState[];
  downloadedCount: number;
  totalChunks: number;
}

const ChunkToggleCard: React.FC<ChunkToggleCardProps> = ({
  isExpanded,
  onToggle,
  chunks,
  downloadedCount,
  totalChunks,
}) => {
  const progress = totalChunks > 0 ? (downloadedCount / totalChunks) * 100 : 0;

  // Mini preview grid (5x3 = 15 chunks)
  const previewChunks = chunks.slice(0, 15);

  const getChunkColor = (status: ChunkState['status']) => {
    switch (status) {
      case 'from_peer':
        return 'bg-[#00D4FF]';
      case 'done':
        return 'bg-[#00C853]';
      case 'active':
        return 'bg-[#FFB830] animate-pulse';
      case 'failed':
        return 'bg-[#FF3D3D]';
      default:
        return 'bg-[#1a2a3a]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 hover-lift"
      whileHover={{ borderColor: 'hsl(var(--secondary))' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-secondary/10">
          <Grid3X3 className="w-5 h-5 text-secondary" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          {downloadedCount}/{totalChunks || 1} chunks downloaded
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <span className="text-2xl font-bold">{progress.toFixed(0)}%</span>

      <p className="text-caption mb-4">Chunk Progress</p>

      {/* Mini Preview Grid */}
      {!isExpanded && (
        <div className="grid grid-cols-5 gap-1 mb-4">
          {previewChunks.map((chunk, i) => (
            <div
              key={chunk.id || i}
              className={`aspect-square rounded ${getChunkColor(chunk.status)}`}
            />
          ))}
          {Array.from({ length: Math.max(0, 15 - previewChunks.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded bg-[#1a2a3a]"
            />
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-secondary/30
                 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/50
                 flex items-center justify-center gap-2 transition-all duration-300"
      >
        <span className="text-sm font-medium">
          {isExpanded ? 'Hide Chunk Grid' : 'View Chunk Grid'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
};

export default ChunkToggleCard;
