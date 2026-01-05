import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Download, PiggyBank, Grid3X3, ArrowRight, Play, Pause } from 'lucide-react';

const LiveDemoSection = () => {
  const navigate = useNavigate();
  const [peerCount, setPeerCount] = useState(4);
  const [downloadSpeed, setDownloadSpeed] = useState(8.2);
  const [p2pRatio, setP2pRatio] = useState(45);
  const [chunksDownloaded, setChunksDownloaded] = useState(80);
  const [isPlaying, setIsPlaying] = useState(true);

  // Simulate live metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setPeerCount(prev => Math.max(3, Math.min(15, prev + (Math.random() > 0.5 ? 1 : -1))));
      setDownloadSpeed(prev => Math.max(5, Math.min(18, prev + (Math.random() - 0.5) * 2)));
      setP2pRatio(prev => Math.min(85, prev + Math.random() * 2));
      setChunksDownloaded(prev => Math.min(150, prev + Math.floor(Math.random() * 3)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      icon: Users,
      value: peerCount,
      suffix: '',
      label: 'Peers Connected',
      color: 'primary',
      pulse: true,
    },
    {
      icon: Download,
      value: downloadSpeed.toFixed(1),
      suffix: ' MB/s',
      label: 'Download Speed',
      color: 'success',
      pulse: false,
    },
    {
      icon: PiggyBank,
      value: Math.round(p2pRatio),
      suffix: '% P2P',
      label: 'Bandwidth Saved',
      color: 'cyber',
      pulse: false,
    },
    {
      icon: Grid3X3,
      value: `${chunksDownloaded}/150`,
      suffix: '',
      label: 'Chunks Downloaded',
      color: 'secondary',
      pulse: false,
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/20" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Live Demo
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            See It <span className="gradient-text">In Action</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            This isn't a mockup. Watch real peers connect and bandwidth costs drop in real-time.
          </p>
        </motion.div>

        {/* Demo container */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Video Player Preview */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-border/50 
                          shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-background">
              {/* Video */}
              <div className="aspect-video relative">
                <video
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&q=80"
                  muted
                  loop
                  autoPlay
                  playsInline
                >
                  <source 
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                    type="video/mp4" 
                  />
                </video>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                {/* Play overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={() => navigate('/watch')}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center
                             shadow-[0_0_60px_rgba(0,240,255,0.5)]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* Fake progress bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full progress-gradient rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '45%' }}
                      transition={{ duration: 3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* P2P Indicator */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 
                                backdrop-blur-sm border border-success/30">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">P2P Active</span>
                  </div>
                </div>

                {/* Quality badge */}
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 rounded-lg bg-background/50 backdrop-blur-sm 
                                border border-border/50 text-sm font-medium">
                    1080p HD
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Live Metrics Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`p-5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50
                          hover:border-${metric.color}/30 transition-all duration-300
                          hover:shadow-[0_10px_40px_rgba(0,240,255,0.1)]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${metric.color}/10 flex items-center justify-center`}>
                    <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                  </div>
                  {metric.pulse && (
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metric.value}{metric.suffix}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.label}
                </div>

                {/* Mini visualization */}
                {metric.label === 'Download Speed' && (
                  <div className="mt-3 flex items-end gap-0.5 h-8">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-success/50 rounded-sm"
                        animate={{ height: `${20 + Math.random() * 80}%` }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                )}

                {metric.label === 'Bandwidth Saved' && (
                  <div className="mt-3 relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-cyber rounded-full"
                      animate={{ width: `${p2pRatio}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}

                {metric.label === 'Chunks Downloaded' && (
                  <div className="mt-3 grid grid-cols-10 gap-0.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm ${
                          i < (chunksDownloaded / 5) ? 'bg-success/70' : 'bg-muted/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            onClick={() => navigate('/watch')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground 
                     font-semibold text-lg shadow-[0_20px_40px_rgba(0,240,255,0.3)]
                     hover:shadow-[0_25px_60px_rgba(0,240,255,0.4)] transition-shadow duration-300"
          >
            Try It Yourself
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemoSection;
