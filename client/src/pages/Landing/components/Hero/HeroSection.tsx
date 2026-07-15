import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import MetricsCounter from './MetricsCounter';
import { useMouseParallax } from '../../hooks/useMouseParallax';

/**
 * Animated gradient orbs that respond to mouse movement — replaces the 3D globe.
 * Pure CSS/Framer Motion, no WebGL dependency. Performant and clean.
 */
function AnimatedBackground({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Primary orb — emerald */}
      <motion.div
        animate={{
          x: mouse.x * 30,
          y: mouse.y * 30,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
      />

      {/* Secondary orb — cyan */}
      <motion.div
        animate={{
          x: mouse.x * -20,
          y: mouse.y * -20,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 80 }}
        className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #22D3EE 0%, transparent 70%)' }}
      />

      {/* Accent orb — purple */}
      <motion.div
        animate={{
          x: mouse.x * 15,
          y: mouse.y * -15,
        }}
        transition={{ type: 'spring', damping: 35, stiffness: 90 }}
        className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] rounded-full opacity-10 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles (CSS-only) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#10B981]/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection({ className }: { className?: string }) {
  const mouse = useMouseParallax();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${className ?? ''}`}
    >
      {/* Animated background (replaces 3D globe) */}
      {!prefersReducedMotion && <AnimatedBackground mouse={mouse} />}

      {/* Static fallback for reduced motion */}
      {prefersReducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.1) 0%, rgba(11, 15, 20, 0.95) 70%)',
          }}
        />
      )}

      {/* Overlay content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-[#F8FAFC] mb-4 tracking-tight">
          CloudGuardian AI
        </h1>
        <p className="text-xl md:text-2xl text-[#94A3B8] mb-8 max-w-2xl mx-auto">
          AI-Powered Cloud Cost Optimization
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            className="px-8 py-3 rounded-lg bg-[#10B981] text-white font-semibold text-lg
                       hover:bg-[#0ea572] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#0B0F14]"
          >
            Start Scanning
          </button>
          <button
            className="px-8 py-3 rounded-lg border-2 border-[#10B981] text-[#10B981] font-semibold text-lg
                       hover:bg-[#10B981]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#0B0F14]"
          >
            View Demo
          </button>
        </div>
      </motion.div>

      {/* Metrics at bottom */}
      <div className="relative z-10 mt-auto pb-12 w-full px-4">
        <MetricsCounter />
      </div>
    </section>
  );
}
