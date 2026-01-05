import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Shield, Code2, Eye } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  const trustIndicators = [
    { icon: Code2, label: 'Open Source' },
    { icon: Shield, label: 'Privacy First' },
    { icon: Eye, label: 'No Tracking' },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-40"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 50% at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 60% at 40% 40%, hsl(var(--secondary) / 0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse 70% 40% at 60% 60%, hsl(var(--accent) / 0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 50% at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-animated opacity-20" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Experience the
            <br />
            <span className="gradient-text">Future of Streaming?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of users streaming smarter, not harder. 
            Start using StreamSwarm today and see the difference.
          </p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate('/watch')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 lg:px-12 lg:py-6 
                     rounded-full bg-foreground text-background font-bold text-lg lg:text-xl
                     shadow-[0_30px_80px_rgba(255,255,255,0.2)] hover:shadow-[0_40px_100px_rgba(255,255,255,0.3)]
                     transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Start Streaming Now</span>
            <motion.span
              className="relative z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.span>
            
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 
                           text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Start Streaming Now <ArrowRight className="w-6 h-6" />
            </span>
          </motion.button>

          {/* Secondary text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mt-6"
          >
            Free forever. No credit card required.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10"
          >
            {trustIndicators.map((indicator, index) => (
              <div key={indicator.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                <indicator.icon className="w-4 h-4" />
                <span>{indicator.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
