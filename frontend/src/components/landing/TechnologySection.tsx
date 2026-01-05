import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Lock, Code2, Boxes, Cpu, Globe2, Gauge, Shield, Zap } from 'lucide-react';

const TechnologySection = () => {
  const technologies = [
    { icon: Wifi, name: 'WebRTC', description: 'Real-time P2P connections' },
    { icon: Boxes, name: 'BitTorrent', description: 'Proven distribution protocol' },
    { icon: Lock, name: 'AES-256', description: 'End-to-end encryption' },
    { icon: Code2, name: 'WebAssembly', description: 'Native performance' },
    { icon: Globe2, name: 'DHT', description: 'Decentralized discovery' },
    { icon: Cpu, name: 'WASM', description: 'Hardware acceleration' },
  ];

  const metrics = [
    { label: 'Latency', streamswarm: '45ms', traditional: '150ms', improvement: '70%' },
    { label: 'Bandwidth Cost', streamswarm: '$0.003/GB', traditional: '$0.01/GB', improvement: '70%' },
    { label: 'Scalability', streamswarm: 'Infinite', traditional: 'Limited', improvement: '∞' },
  ];

  const badges = [
    { icon: Wifi, label: 'WebRTC' },
    { icon: Shield, label: 'DHT' },
    { icon: Lock, label: 'Encryption' },
    { icon: Code2, label: 'Open Source' },
    { icon: Globe2, label: 'Cross-Platform' },
  ];

  return (
    <section id="technology" className="py-24 lg:py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/10" />
      
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
            Under The Hood
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Built With <span className="gradient-text">Cutting-Edge</span> Tech
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade technology stack designed for scale and performance.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Tech Stack Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto flex items-center justify-center">
              {/* Center logo - COMPLETELY STATIONARY */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-28 h-28 rounded-full bg-background border-[3px] border-transparent flex items-center justify-center shadow-[0_0_60px_rgba(0,240,255,0.3)]"
                     style={{
                       backgroundImage: 'linear-gradient(hsl(var(--background)), hsl(var(--background))), linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                       backgroundOrigin: 'border-box',
                       backgroundClip: 'padding-box, border-box',
                     }}>
                  <span className="text-5xl font-extrabold gradient-text select-none">S</span>
                </div>
              </div>

              {/* Orbiting tech icons */}
              {technologies.map((tech, index) => {
                const angle = (index / technologies.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={tech.name}
                    className="absolute top-1/2 left-1/2 z-10"
                    initial={{ x, y, scale: 0 }}
                    whileInView={{ x, y, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="group relative -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 
                                    flex items-center justify-center cursor-pointer
                                    hover:border-primary/50 hover:shadow-[0_10px_40px_rgba(0,240,255,0.2)]
                                    transition-all duration-300">
                        <tech.icon className="w-7 h-7 text-primary" />
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                                    transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        <div className="px-3 py-2 rounded-lg bg-popover border border-border text-sm">
                          <div className="font-semibold text-foreground">{tech.name}</div>
                          <div className="text-xs text-muted-foreground">{tech.description}</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {technologies.map((_, index) => {
                  const angle = (index / technologies.length) * 2 * Math.PI - Math.PI / 2;
                  const x = 200 + Math.cos(angle) * 140;
                  const y = 200 + Math.sin(angle) * 140;
                  return (
                    <motion.line
                      key={index}
                      x1="200"
                      y1="200"
                      x2={x}
                      y2={y}
                      stroke="url(#lineGradient)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    />
                  );
                })}
              </svg>
            </div>
          </motion.div>

          {/* Right - Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-2">Performance That Scales</h3>
              <p className="text-muted-foreground">
                See how StreamSwarm compares to traditional CDN delivery.
              </p>
            </div>

            {/* Comparison bars */}
            <div className="space-y-6">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{metric.label}</span>
                    <span className="text-success font-semibold">-{metric.improvement} better</span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* StreamSwarm bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs text-muted-foreground">StreamSwarm</span>
                      <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: metric.label === 'Latency' ? '30%' : metric.label === 'Bandwidth Cost' ? '30%' : '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="w-20 text-xs font-mono text-primary">{metric.streamswarm}</span>
                    </div>
                    
                    {/* Traditional bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs text-muted-foreground">Traditional</span>
                      <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-muted-foreground/50 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: metric.label === 'Latency' ? '100%' : metric.label === 'Bandwidth Cost' ? '100%' : '30%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                      <span className="w-20 text-xs font-mono text-muted-foreground">{metric.traditional}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 
                           border border-border/50 hover:border-primary/30 transition-colors cursor-default"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
