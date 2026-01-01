import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface SpeedCardProps {
  downloadSpeed: number;
  speedHistory: number[];
}

const SpeedCard: React.FC<SpeedCardProps> = ({ downloadSpeed, speedHistory }) => {
  const maxSpeed = Math.max(...speedHistory, 1);
  const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
  const peakSpeed = Math.max(...speedHistory);

  // Generate sparkline path
  const generatePath = () => {
    const width = 200;
    const height = 60;
    const points = speedHistory.slice(-60);
    const stepX = width / (points.length - 1);

    const pathData = points
      .map((speed, i) => {
        const x = i * stepX;
        const y = height - (speed / maxSpeed) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

    return { linePath: pathData, areaPath };
  };

  const { linePath, areaPath } = generatePath();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 hover-lift"
      whileHover={{ borderColor: 'hsl(var(--primary))' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-success/10">
          <Download className="w-5 h-5 text-success" />
        </div>
      </div>

      <div className="mb-2">
        <motion.span
          key={Math.floor(downloadSpeed * 10)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold gradient-text-green"
        >
          {downloadSpeed.toFixed(1)}
        </motion.span>
        <span className="text-lg text-muted-foreground ml-1">MB/s</span>
      </div>

      <p className="text-caption mb-4">Download Speed</p>

      {/* Sparkline Chart */}
      <div className="relative h-16 w-full">
        <svg
          viewBox="0 0 200 60"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            d={areaPath}
            fill="url(#speedGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Avg: {avgSpeed.toFixed(1)} MB/s</span>
        <span>Peak: {peakSpeed.toFixed(1)} MB/s</span>
      </div>
    </motion.div>
  );
};

export default SpeedCard;
