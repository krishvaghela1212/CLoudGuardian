import React, { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import Hero from './Hero';
import DiscoveryEngine from './DiscoveryEngine';
import RuleEngine from './RuleEngine';
import ExplanationEngine from './ExplanationEngine';
import DashboardPreview from './DashboardPreview';
import PlatformFeatures from './PlatformFeatures';
import Architecture from './Architecture';
import Footer from './Footer';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [isDark]);

  return (
    <div className="bg-background min-h-screen text-text overflow-hidden selection:bg-secondary/30 font-sans transition-colors duration-300">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-accent z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 z-[100] p-3 rounded-full bg-surface border border-muted/20 shadow-lg hover:border-secondary transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5 text-secondary" /> : <Moon className="w-5 h-5 text-primary" />}
      </button>
      
      <main className="relative z-10">
        <Hero />
        <DiscoveryEngine />
        <RuleEngine />
        <ExplanationEngine />
        <DashboardPreview />
        <PlatformFeatures />
        <Architecture />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
