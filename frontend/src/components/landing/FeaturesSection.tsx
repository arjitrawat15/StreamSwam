import React from 'react';
import { motion } from 'framer-motion';
import { Zap, PiggyBank, Globe, ArrowRight } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: '10x Faster Downloads',
      description: 'Download from multiple peers simultaneously. No more waiting for buffering. Stream 4K video instantly, even on slower connections.',
      metric: '10x',
      metricLabel: 'Speed Increase',
      color: 'primary',
      gradient: 'from-primary to-secondary',
    },
    {
      icon: PiggyBank,
      title: '70% Bandwidth Savings',
      description: 'Reduce CDN costs dramatically by distributing load across peers. Pay less for bandwidth while delivering better performance.',
      metric: '70%',
      metricLabel: 'Cost Reduction',
      color: 'success',
      gradient: 'from-success to-cyber',
    },
    {
      icon: Globe,
      title: 'Global Peer Network',
      description: 'Connect to thousands of peers worldwide. If one fails, others step in automatically. Built for reliability from day one.',
      metric: '99.9%',
      metricLabel: 'Uptime',
      color: 'secondary',
      gradient: 'from-secondary to-accent',
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 px-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-primary text-sm font-semibold uppercase tracking-wider mb-4"
          >
            Why StreamSwarm
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Why StreamSwarm <br className="hidden sm:block" />
            <span className="gradient-text">Changes Everything</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Traditional streaming is broken. We fixed it with peer-to-peer technology.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="group h-full p-8 lg:p-10 rounded-3xl bg-card/50 backdrop-blur-xl
                         border border-border/50 hover:border-primary/30
                         transition-all duration-500
                         hover:shadow-[0_30px_60px_rgba(0,240,255,0.15)]"
              >
                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} 
                           flex items-center justify-center mb-8
                           group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-8 h-8 text-background" />
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {feature.description}
                </p>

                {/* Metric */}
                <div className="pt-6 border-t border-border/50">
                  <div className={`text-4xl lg:text-5xl font-bold gradient-text-${feature.color === 'success' ? 'green' : feature.color === 'primary' ? 'cyan' : ''} mb-1`}
                       style={feature.color === 'secondary' ? { background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--accent)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
                    {feature.metric}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    {feature.metricLabel}
                  </div>
                </div>

                {/* Learn more link */}
                <motion.a 
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-primary
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ x: 4 }}
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </motion.a>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
