import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Network, Play, ArrowRight, Cloud, Layers, Zap } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload Your Video',
      description: 'Videos are automatically chunked into small pieces and hashed for verification. Our system optimizes each piece for maximum distribution efficiency.',
      details: 'Each chunk is typically 2-4 seconds of video, hashed with SHA-256 for integrity verification.',
      visual: 'upload',
    },
    {
      number: '02',
      icon: Network,
      title: 'Smart Distribution',
      description: 'Chunks spread across the peer network automatically. Smart replication ensures availability even when peers leave the network.',
      details: 'DHT-based peer discovery with WebRTC for direct peer connections.',
      visual: 'network',
    },
    {
      number: '03',
      icon: Zap,
      title: 'Lightning Fast Streaming',
      description: 'Download different chunks from multiple peers simultaneously. CDN fallback ensures smooth playback is always guaranteed.',
      details: 'Parallel downloads from 8+ peers with intelligent chunk scheduling.',
      visual: 'stream',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            The Process
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            How StreamSwarm <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple technology, revolutionary results. See how we transform video delivery.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-px -translate-y-1/2">
            <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-accent" />
            {/* Animated dots */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary))]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="group h-full p-8 lg:p-10 rounded-3xl bg-card/50 backdrop-blur-xl
                           border border-border/50 hover:border-primary/30
                           transition-all duration-500
                           hover:shadow-[0_30px_60px_rgba(0,240,255,0.15)]"
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-8 px-4 py-1 rounded-full bg-primary text-primary-foreground
                                text-sm font-bold tracking-wider">
                    STEP {step.number}
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl gradient-animated
                               flex items-center justify-center mb-8 mt-4
                               shadow-[0_10px_40px_rgba(0,240,255,0.3)]">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Visual representation */}
                  <div className="h-32 rounded-xl bg-muted/30 border border-border/50 overflow-hidden mb-6
                                flex items-center justify-center">
                    {step.visual === 'upload' && (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-16 h-16 rounded-lg bg-primary/20 border border-primary/30
                                   flex items-center justify-center"
                          animate={{ scale: [1, 0.8, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Layers className="w-8 h-8 text-primary" />
                        </motion.div>
                        <motion.div
                          animate={{ x: [0, 20, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        </motion.div>
                        <div className="grid grid-cols-3 gap-1">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-4 h-4 rounded bg-success/50"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1, repeat: Infinity, repeatDelay: 2 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {step.visual === 'network' && (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Center node */}
                        <motion.div
                          className="absolute w-12 h-12 rounded-full bg-primary/30 border-2 border-primary
                                   flex items-center justify-center z-10"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Cloud className="w-6 h-6 text-primary" />
                        </motion.div>
                        {/* Orbiting nodes */}
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-6 h-6 rounded-full bg-success/30 border border-success"
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: 'linear',
                              delay: i * 0.5,
                            }}
                            style={{
                              transformOrigin: '50px 50px',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {step.visual === 'stream' && (
                      <div className="flex items-center gap-4 px-4">
                        <div className="grid grid-cols-2 gap-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-6 h-6 rounded bg-secondary/50"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <motion.div
                          className="flex items-center gap-1"
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 text-primary" />
                          <ArrowRight className="w-5 h-5 text-secondary" />
                          <ArrowRight className="w-5 h-5 text-accent" />
                        </motion.div>
                        <motion.div
                          className="w-16 h-12 rounded bg-gradient-to-br from-primary/30 to-secondary/30
                                   border border-primary/30 flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Play className="w-6 h-6 text-primary" fill="currentColor" />
                        </motion.div>
                      </div>
                    )}
                  </div>

                  {/* Technical details */}
                  <div className="text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg px-4 py-3">
                    {step.details}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
