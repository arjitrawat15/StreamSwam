import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank } from 'lucide-react';

interface SavingsCardProps {
  totalSaved: number;
  p2pDownloaded: number;
  cdnDownloaded: number;
  p2pRatio: number;
}

const SavingsCard: React.FC<SavingsCardProps> = ({
  totalSaved,
  p2pDownloaded,
  cdnDownloaded,
  p2pRatio,
}) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (p2pRatio / 100) * circumference;

  const formatSize = (mb: number) => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 hover-lift"
      whileHover={{ borderColor: 'hsl(var(--success))' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-success/10">
          <PiggyBank className="w-5 h-5 text-success" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Stats */}
        <div className="flex-1">
          <motion.span
            key={Math.floor(totalSaved)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold gradient-text-green block"
          >
            {formatSize(totalSaved)}
          </motion.span>

          <span className="text-lg text-success font-medium">
            {p2pRatio.toFixed(0)}% via P2P
          </span>

          <p className="text-caption mt-2">Bandwidth Saved</p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress Ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--success))" />
                <stop offset="100%" stopColor="hsl(var(--cyber))" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{p2pRatio.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 pt-4 border-t border-border/50 text-xs font-mono text-muted-foreground">
        CDN: {formatSize(cdnDownloaded)} | P2P: {formatSize(p2pDownloaded)}
      </div>
    </motion.div>
  );
};

export default SavingsCard;
