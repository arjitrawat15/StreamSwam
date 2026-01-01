import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import LiveDemoSection from '@/components/landing/LiveDemoSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TechnologySection from '@/components/landing/TechnologySection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LiveDemoSection />
        <HowItWorksSection />
        <TechnologySection />
        <StatsSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Landing;
