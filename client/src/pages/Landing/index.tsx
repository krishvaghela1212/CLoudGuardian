import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from './components/Hero/HeroSection';
import DiscoverySection from './components/Discovery/DiscoverySection';
import RuleEngineSection from './components/RuleEngine/RuleEngineSection';
import AIEngineSection from './components/AIEngine/AIEngineSection';
import DashboardSection from './components/Dashboard/DashboardSection';
import FeaturesSection from './components/Features/FeaturesSection';
import ArchitectureSection from './components/Architecture/ArchitectureSection';
import FooterSection from './components/Footer/FooterSection';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Task 9.1: Wire full-page scroll animations — refresh ScrollTrigger after content settles
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Refresh after fonts/content settle to recalculate trigger positions
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(refreshTimeout);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Task 9.2: Detect prefers-reduced-motion and set data attribute on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyReducedMotion = (matches: boolean) => {
      container.setAttribute('data-reduced-motion', String(matches));
    };

    applyReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => applyReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, []);

  // Task 9.3: Performance — cleanup is handled by ctx.revert() above.
  // R3F Canvas is isolated to Hero, ParticleField uses Float32Array,
  // code splitting is already in place via React.lazy in App.jsx.

  return (
    <div
      ref={containerRef}
      className="bg-[#0B0F14] text-[#F8FAFC] overflow-x-hidden scroll-smooth"
    >
      {/* Reduced motion global styles */}
      <style>{`
        [data-reduced-motion="true"] *,
        [data-reduced-motion="true"] *::before,
        [data-reduced-motion="true"] *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        [data-reduced-motion="true"] canvas {
          display: none !important;
        }
      `}</style>

      <HeroSection />
      <DiscoverySection />
      <RuleEngineSection />
      <AIEngineSection />
      <DashboardSection />
      <FeaturesSection />
      <ArchitectureSection />
      <FooterSection />
    </div>
  );
}
