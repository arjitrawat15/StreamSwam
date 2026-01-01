import React from 'react';
import PeerCard from './PeerCard';
import SpeedCard from './SpeedCard';
import SavingsCard from './SavingsCard';
import ChunkToggleCard from './ChunkToggleCard';
import { Peer } from '@/hooks/usePeerSimulation';
import { Chunk } from '@/hooks/useChunkSimulation';

interface MetricsDashboardProps {
  peers: Peer[];
  peerCount: number;
  downloadSpeed: number;
  speedHistory: number[];
  totalDownloaded: number;
  p2pDownloaded: number;
  cdnDownloaded: number;
  p2pRatio: number;
  chunks: Chunk[];
  downloadedCount: number;
  totalChunks: number;
  isChunkGridExpanded: boolean;
  onToggleChunkGrid: () => void;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  peers,
  peerCount,
  downloadSpeed,
  speedHistory,
  totalDownloaded,
  p2pDownloaded,
  cdnDownloaded,
  p2pRatio,
  chunks,
  downloadedCount,
  totalChunks,
  isChunkGridExpanded,
  onToggleChunkGrid,
}) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PeerCard peerCount={peerCount} peers={peers} />
        <SpeedCard downloadSpeed={downloadSpeed} speedHistory={speedHistory} />
        <SavingsCard
          totalSaved={p2pDownloaded}
          p2pDownloaded={p2pDownloaded}
          cdnDownloaded={cdnDownloaded}
          p2pRatio={p2pRatio}
        />
        <ChunkToggleCard
          isExpanded={isChunkGridExpanded}
          onToggle={onToggleChunkGrid}
          chunks={chunks}
          downloadedCount={downloadedCount}
          totalChunks={totalChunks}
        />
      </div>
    </div>
  );
};

export default MetricsDashboard;
