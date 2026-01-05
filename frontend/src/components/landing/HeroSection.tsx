import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronDown, Sparkles, Check } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 5,
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 60%, hsl(var(--secondary) / 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 50% 80%, hsl(var(--accent) / 0.2) 0%, transparent 50%)
            `,
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 gradient-animated opacity-20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `hsl(var(--primary) / ${0.3 + Math.random() * 0.4})`,
              boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / 0.5)`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8
                     bg-background/5 backdrop-blur-xl border border-border/30"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Revolutionary P2P Technology</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl lg:text-[96px] font-extrabold tracking-tight leading-[1.1] mb-8"
        >
          <span className="block text-foreground">Stream Smarter,</span>
          <span className="block gradient-text">Not Harder</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Experience video streaming powered by peer-to-peer technology.
          <br className="hidden sm:block" />
          <span className="text-foreground font-medium">70% faster downloads. Zero buffering.</span> The future is here.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <motion.button
            onClick={() => navigate('/watch')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 sm:px-10 sm:py-5 rounded-full bg-primary text-primary-foreground 
                     font-semibold text-lg flex items-center gap-3 overflow-hidden
                     shadow-[0_20px_60px_rgba(0,240,255,0.4)] hover:shadow-[0_25px_80px_rgba(0,240,255,0.5)]
                     transition-shadow duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-500
                           animate-[shimmer_3s_linear_infinite]" />
            <Play className="w-5 h-5 relative z-10" fill="currentColor" />
            <span className="relative z-10">Watch Demo</span>
            <motion.span 
              className="relative z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>

          <motion.a
            href="#features"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 sm:px-10 sm:py-5 rounded-full border-2 border-border/50 text-foreground 
                     font-semibold text-lg hover:bg-muted/20 hover:border-primary/50
                     transition-all duration-300"
          >
            Learn More
          </motion.a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-muted-foreground mb-16"
        >
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Check className="w-4 h-4 text-success flex-shrink-0" />
            <span>10,000+ active users</span>
          </span>
          <span className="hidden sm:block text-border/50">•</span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Check className="w-4 h-4 text-success flex-shrink-0" />
            <span>1M+ videos streamed</span>
          </span>
          <span className="hidden sm:block text-border/50">•</span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Check className="w-4 h-4 text-success flex-shrink-0" />
            <span>Open source</span>
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#features"
          className="flex flex-col items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.a>
      </motion.div>
    </section>
  );
};

export default HeroSection;
