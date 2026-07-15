import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { COLORS } from '../../utils/constants';

const services = [
  { id: 'ec2', label: 'EC2', color: COLORS.primary },
  { id: 's3', label: 'S3', color: COLORS.secondary },
  { id: 'lambda', label: 'Lambda', color: COLORS.accent },
  { id: 'rds', label: 'RDS', color: COLORS.warning },
];

export default function DiscoverySection() {
  const { ref, isInView } = useScrollAnimation({ start: 'top 80%', end: 'bottom 20%' });

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
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#10B981] to-[#22D3EE] bg-clip-text text-transparent mb-4"
        >
          Cloud Discovery Engine
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          Real-time multi-region resource scanning that discovers all active cloud assets
          and feeds them into our intelligent analysis pipeline.
        </motion.p>
      </motion.div>

      {/* Main Content: Services flowing into Discovery Engine */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 w-full max-w-5xl"
      >
        {/* Service Icons (left side / top on mobile) */}
        <div className="flex flex-col gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={fadeInUp}
              className="relative flex items-center gap-4"
            >
              {/* Service Icon */}
              <motion.div
                animate={isInView ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm"
                style={{ boxShadow: `0 0 20px ${service.color}33` }}
              >
                <span className="text-sm font-bold" style={{ color: service.color }}>
                  {service.label}
                </span>
              </motion.div>

              {/* Animated connecting line */}
              <div className="hidden md:block w-24 h-px relative overflow-hidden">
                <div
                  className="absolute inset-0 border-t border-dashed"
                  style={{ borderColor: `${service.color}66` }}
                />
                <motion.div
                  animate={isInView ? { x: ['-100%', '100%'] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                  className="absolute top-0 left-0 w-6 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${service.color}, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated vertical connecting lines (mobile) */}
        <div className="md:hidden w-px h-12 relative overflow-hidden">
          <div className="absolute inset-0 border-l border-dashed border-white/20" />
          <motion.div
            animate={isInView ? { y: ['-100%', '100%'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute left-0 top-0 w-px h-6 bg-gradient-to-b from-transparent via-[#10B981] to-transparent"
          />
        </div>

        {/* Central Discovery Engine Element */}
        <motion.div
          variants={fadeInUp}
          className="relative"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={isInView ? { scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-[#10B981]/30"
            style={{ margin: '-12px' }}
          />

          {/* Main engine container */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center border border-[#10B981]/40 bg-[#10B981]/5 backdrop-blur-sm relative overflow-hidden">
            {/* Animated scan line */}
            <motion.div
              animate={isInView ? { rotate: 360 } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 rounded-full border-t-2 border-[#10B981]/60"
            />

            {/* Inner content */}
            <div className="relative z-10 text-center px-4">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#10B981]">Discovery</span>
              <span className="text-xs text-[#94A3B8] block mt-1">Engine</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
