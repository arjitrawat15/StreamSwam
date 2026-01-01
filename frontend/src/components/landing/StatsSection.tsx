import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Users, TrendingDown, Quote } from 'lucide-react';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [counts, setCounts] = useState({ views: 0, savings: 0, users: 0 });

  useEffect(() => {
    if (!isInView) return;

    const targets = { views: 1000000, savings: 70, users: 12000 };
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Ease out quart

      setCounts({
        views: Math.floor(eased * targets.views),
        savings: Math.floor(eased * targets.savings),
        users: Math.floor(eased * targets.users),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView]);

  const formatNumber = (num: number, suffix: string = '') => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    return `${num}${suffix}`;
  };

  const stats = [
    {
      icon: Play,
      value: formatNumber(counts.views),
      label: 'Videos Streamed',
      color: 'primary',
      description: 'Hours of content delivered via P2P',
    },
    {
      icon: TrendingDown,
      value: `${counts.savings}%`,
      label: 'Bandwidth Saved',
      color: 'success',
      description: 'Average cost reduction for our users',
    },
    {
      icon: Users,
      value: formatNumber(counts.users),
      label: 'Active Users',
      color: 'secondary',
      description: 'Growing community of streamers',
    },
  ];

  const testimonials = [
    {
      quote: "StreamSwarm reduced our bandwidth costs by 65%. It's been a game changer for our platform.",
      author: 'Sarah Chen',
      role: 'CTO, MediaFlow',
      avatar: 'SC',
    },
    {
      quote: "The seamless integration and performance gains exceeded our expectations. Highly recommended.",
      author: 'Marcus Johnson',
      role: 'Lead Engineer, VideoHub',
      avatar: 'MJ',
    },
  ];

  return (
    <section id="stats" className="py-24 lg:py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Social Proof
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            Trusted By <span className="gradient-text">Thousands</span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-10 rounded-3xl bg-card/30 border border-border/30 backdrop-blur-sm
                         hover:border-primary/30 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                              bg-${stat.color}/10 mb-6`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}`} />
                </div>
                
                <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-2
                              ${stat.color === 'success' ? 'gradient-text-green' : 
                                stat.color === 'primary' ? 'gradient-text-cyan' : 'gradient-text'}`}>
                  {stat.value}
                </div>
                
                <div className="text-xl font-semibold text-foreground mb-2">
                  {stat.label}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50
                         hover:border-primary/30 transition-all duration-300"
              >
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                
                <p className="text-lg text-foreground leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-animated flex items-center justify-center
                                text-primary-foreground font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-muted/30 
                     border border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="font-medium">Star on GitHub</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-semibold">
              2.5k
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
