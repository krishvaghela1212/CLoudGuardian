import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { FINDINGS } from '../../utils/constants';

const severityColors: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#22D3EE',
};

export default function RuleEngineSection() {
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
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] bg-clip-text text-transparent mb-4"
        >
          FinOps Rule Engine
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          Intelligent cost optimization rules analyze every resource for waste,
          misconfiguration, and savings opportunities.
        </motion.p>
      </motion.div>

      {/* Content: AI Core + Finding Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full max-w-6xl">
        {/* AI Core Visual - Concentric circles with pulse */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex-shrink-0"
        >
          {/* Outer ring */}
          <motion.div
            animate={isInView ? { scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-[#7C3AED]/30"
            style={{ margin: '-24px' }}
          />
          {/* Middle ring */}
          <motion.div
            animate={isInView ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
            className="absolute inset-0 rounded-full border border-[#7C3AED]/40"
            style={{ margin: '-12px' }}
          />
          {/* Core */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center border-2 border-[#7C3AED]/50 bg-[#7C3AED]/10 backdrop-blur-sm relative">
            <motion.div
              animate={isInView ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <div className="text-2xl mb-1">⚙️</div>
              <span className="text-xs font-semibold text-[#7C3AED]">AI Core</span>
            </motion.div>
            {/* Pulse effect */}
            <motion.div
              animate={isInView ? { scale: [1, 1.5], opacity: [0.4, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-[#7C3AED]/20"
            />
          </div>
        </motion.div>

        {/* Finding Cards */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg"
        >
          {FINDINGS.map((finding) => (
            <motion.div
              key={finding.id}
              variants={fadeInUp}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-colors"
            >
              {/* Severity Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: severityColors[finding.severity] }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: severityColors[finding.severity] }}
                >
                  {finding.severity}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-[#F8FAFC] mb-1">
                {finding.title}
              </h4>

              {/* Service & Savings */}
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>{finding.service}</span>
                <span className="text-[#10B981] font-medium">{finding.estimatedSavings}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
