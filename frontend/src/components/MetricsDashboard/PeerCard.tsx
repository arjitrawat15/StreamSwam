import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Peer } from '@/hooks/usePeerSimulation';

interface PeerCardProps {
  peerCount: number;
  peers: Peer[];
}

const PeerCard: React.FC<PeerCardProps> = ({ peerCount, peers }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 hover-lift cursor-pointer"
      whileHover={{ borderColor: 'hsl(var(--primary))' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Users className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="mb-2">
        <motion.span
          key={peerCount}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-extrabold gradient-text-cyan"
        >
          {peerCount}
        </motion.span>
      </div>

      <p className="text-caption mb-4">Active Peers</p>

      {/* Peer Avatars */}
      <div className="flex items-center -space-x-2">
        {peers.slice(0, 5).map((peer, index) => (
          <motion.div
            key={peer.id}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-8 h-8 rounded-full border-2 border-card overflow-hidden"
          >
            <img
              src={peer.avatar}
              alt={peer.id}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
        {peers.length > 5 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full border-2 border-card bg-muted
                     flex items-center justify-center text-xs font-medium"
          >
            +{peers.length - 5}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PeerCard;
