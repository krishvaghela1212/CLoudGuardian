import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';

const phases = [
  { id: 'problem', label: 'Problem', color: '#EF4444' },
  { id: 'analysis', label: 'Analysis', color: '#F59E0B' },
  { id: 'recommendation', label: 'Recommendation', color: '#22D3EE' },
  { id: 'action', label: 'Action', color: '#10B981' },
];

const codeText = `aws ec2 stop-instances --instance-ids i-0abc123\n# Savings: $142.80/month\n# Downsize to t3.medium for 60% reduction`;

export default function AIEngineSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const { displayText, isComplete } = useTypingAnimation(codeText, 40, isVisible);

  return (
    <section
      ref={sectionRef}
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
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#10B981] bg-clip-text text-transparent mb-4"
        >
          AI Explanation Engine
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          AI-powered analysis that explains findings in plain language and provides
          actionable remediation commands.
        </motion.p>
      </motion.div>

      {/* Content: Timeline + Code Block */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-20 w-full max-w-5xl">
        {/* Phase Timeline (vertical) */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-col gap-0"
        >
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              variants={fadeInUp}
              className="flex items-center gap-4"
            >
              {/* Timeline node + connector */}
              <div className="flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                  style={{
                    borderColor: phase.color,
                    backgroundColor: isVisible ? `${phase.color}33` : 'transparent',
                  }}
                />
                {index < phases.length - 1 && (
                  <div
                    className="w-px h-10"
                    style={{ backgroundColor: `${phase.color}44` }}
                  />
                )}
              </div>

              {/* Phase label */}
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: phase.color }}
              >
                {phase.label}
              </span>

              {/* Arrow */}
              {index < phases.length - 1 && (
                <span className="text-[#94A3B8] text-xs hidden sm:inline">→</span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Code Block with typing animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full max-w-lg"
        >
          {/* Green glow effect */}
          <div
            className="absolute -inset-2 rounded-xl opacity-30 blur-xl"
            style={{
              background: 'radial-gradient(ellipse at center, #10B98144, transparent 70%)',
            }}
          />

          {/* Code container */}
          <div className="relative rounded-xl border border-[#10B981]/30 bg-[#0B0F14]/90 backdrop-blur-sm overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/70" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/70" />
              <div className="w-3 h-3 rounded-full bg-[#10B981]/70" />
              <span className="ml-3 text-xs text-[#94A3B8]">cloudguardian-ai</span>
            </div>

            {/* Code content */}
            <div className="p-5 font-mono text-sm leading-relaxed">
              <pre className="text-[#10B981] whitespace-pre-wrap">
                {displayText}
                {!isComplete && (
                  <span className="inline-block w-2 h-4 bg-[#10B981] animate-pulse ml-0.5" />
                )}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
