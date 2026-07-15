import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { PIPELINE_STAGES } from '../../utils/constants';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function ArchitectureSection() {
  const { ref, progress } = useScrollAnimation({
    start: 'top 70%',
    end: 'bottom 30%',
    scrub: true,
  });

  // Determine which stage is active based on scroll progress
  const activeIndex = Math.min(
    Math.floor(progress * PIPELINE_STAGES.length),
    PIPELINE_STAGES.length - 1
  );

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6"
    >
      {/* Section Heading */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] bg-clip-text text-transparent mb-4"
        >
          System Architecture
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          End-to-end pipeline from authentication to actionable insights.
        </motion.p>
      </motion.div>

      {/* Pipeline — Horizontal on desktop, vertical on mobile */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="w-full max-w-6xl"
      >
        {/* Desktop: horizontal layout */}
        <div className="hidden md:flex items-center justify-between relative">
          {/* Connecting line behind stages */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 z-0" />

          {/* Progress line */}
          <div
            className="absolute top-1/2 left-0 h-px -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${(activeIndex / (PIPELINE_STAGES.length - 1)) * 100}%`,
              background: `linear-gradient(to right, #7C3AED, #22D3EE)`,
            }}
          />

          {PIPELINE_STAGES.map((stage, index) => {
            const isActive = index <= activeIndex;
            return (
              <motion.div
                key={stage.id}
                variants={fadeInUp}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Stage Card */}
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    isActive
                      ? 'bg-white/10 backdrop-blur-xl shadow-lg'
                      : 'bg-white/5 backdrop-blur-sm'
                  }`}
                  style={{
                    borderColor: isActive ? stage.color : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 20px ${stage.color}33` : 'none',
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: isActive ? stage.color : '#94A3B8' }}
                  >
                    {stage.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  className={`mt-3 text-sm font-semibold transition-colors duration-300 ${
                    isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'
                  }`}
                >
                  {stage.label}
                </span>

                {/* Description (shown when active) */}
                <p
                  className={`mt-2 text-xs max-w-[140px] transition-all duration-500 ${
                    isActive
                      ? 'opacity-100 text-[#94A3B8]'
                      : 'opacity-0 text-transparent'
                  }`}
                >
                  {stage.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: vertical layout */}
        <div className="flex flex-col md:hidden gap-4 relative">
          {/* Vertical connecting line */}
          <div className="absolute top-0 bottom-0 left-10 w-px bg-white/10 z-0" />

          {/* Progress line (vertical) */}
          <div
            className="absolute top-0 left-10 w-px z-0 transition-all duration-500"
            style={{
              height: `${(activeIndex / (PIPELINE_STAGES.length - 1)) * 100}%`,
              background: `linear-gradient(to bottom, #7C3AED, #22D3EE)`,
            }}
          />

          {PIPELINE_STAGES.map((stage, index) => {
            const isActive = index <= activeIndex;
            return (
              <motion.div
                key={stage.id}
                variants={fadeInUp}
                className="relative z-10 flex items-center gap-4"
              >
                {/* Stage icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 flex-shrink-0 transition-all duration-500 ${
                    isActive
                      ? 'bg-white/10 backdrop-blur-xl'
                      : 'bg-white/5 backdrop-blur-sm'
                  }`}
                  style={{
                    borderColor: isActive ? stage.color : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 15px ${stage.color}33` : 'none',
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: isActive ? stage.color : '#94A3B8' }}
                  >
                    {stage.icon}
                  </span>
                </div>

                {/* Text content */}
                <div>
                  <span
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <p
                    className={`text-xs mt-1 transition-all duration-500 ${
                      isActive ? 'opacity-100 text-[#94A3B8]' : 'opacity-0'
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
