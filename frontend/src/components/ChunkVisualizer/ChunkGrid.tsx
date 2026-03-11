import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChunkState, DownloadStats } from '@/services/ChunkDownloader';

interface ChunkGridProps {
  chunks: ChunkState[];
  stats: DownloadStats;
  totalChunks: number;
  isExpanded: boolean;
}

const ChunkGrid: React.FC<ChunkGridProps> = ({ 
  chunks, 
  stats, 
  totalChunks, 
  isExpanded 
}) => {

  const getCellStyles = (status: ChunkState['status']): React.CSSProperties => {
    switch (status) {
      case 'pending':
        return { background: '#1a2a3a' };
      case 'active':
        return { 
          background: '#FFB830', 
          boxShadow: '0 0 6px #FFB830',
          animation: 'pulse 0.8s ease-in-out infinite' 
        };
      case 'done':
        return { background: '#00C853' }; // solid green
      case 'from_peer':
        return { 
          background: '#00D4FF', 
          boxShadow: '0 0 8px #00D4FF' 
        };
      case 'failed':
        return { background: '#FF3D3D' };
      default:
        return { background: '#1a2a3a' };
    }
  };

  const cdnPercent = stats.downloaded > 0 ? Math.round((stats.fromCDN / stats.downloaded) * 100) : 0;
  const peerPercent = stats.downloaded > 0 ? Math.round((stats.fromPeers / stats.downloaded) * 100) : 0;

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
          <div className="glass-card p-6 border border-white/10 rounded-xl bg-black/40">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Chunk Map
              </h3>
              <p className="text-sm text-cyan-100/70 font-mono">
                {stats.downloaded} / {totalChunks || 1} chunks · {stats.progressPercent}%
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-[6px] bg-[#1a2a3a] rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-cyan-400 rounded-full"
                style={{ 
                  width: `${stats.progressPercent}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">⬇ Download Speed</div>
                <div className="text-lg font-mono text-white">{stats.currentSpeedMbps || 0} MB/s</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">🌐 From CDN</div>
                <div className="text-lg font-mono text-green-400">{cdnPercent}%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">🔵 From Peers</div>
                <div className="text-lg font-mono text-cyan-400">{peerPercent}%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">✅ Verified</div>
                <div className="text-lg font-mono text-white">{stats.downloaded}</div>
              </div>
            </div>

            {/* Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 12px)',
                gap: '2px',
                justifyContent: 'center'
              }}
              className="mb-6 p-4 bg-black/30 rounded-lg border border-white/5"
            >
              {chunks.map((chunk, index) => (
                <div
                  key={chunk.id || index}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                    ...getCellStyles(chunk.status)
                  }}
                  title={`Chunk #${chunk.id} - ${chunk.status.toUpperCase()}`}
                />
              ))}
              
              {/* Fill remaining empty cells if totalChunks > chunks.length */}
              {Array.from({ length: Math.max(0, totalChunks - chunks.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: '#1a2a3a'
                  }}
                />
              ))}
            </div>

            {/* Legend Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ background: '#1a2a3a' }} />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ background: '#FFB830', boxShadow: '0 0 6px #FFB830' }} />
                <span>Downloading</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ background: '#00C853' }} />
                <span>CDN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }} />
                <span>Peer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px]" style={{ background: '#FF3D3D' }} />
                <span>Failed</span>
              </div>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChunkGrid;
