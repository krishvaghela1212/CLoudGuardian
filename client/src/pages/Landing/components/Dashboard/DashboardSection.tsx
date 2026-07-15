import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { useCountUp } from '../../hooks/useCountUp';

const chartBars = [
  { label: 'EC2', value: 85, color: '#10B981' },
  { label: 'S3', value: 60, color: '#22D3EE' },
  { label: 'RDS', value: 72, color: '#7C3AED' },
  { label: 'Lambda', value: 45, color: '#F59E0B' },
];

const recentFindings = [
  { id: 1, title: 'Idle EC2 instance detected', severity: 'critical', color: '#EF4444' },
  { id: 2, title: 'Unused EBS volume found', severity: 'warning', color: '#F59E0B' },
  { id: 3, title: 'S3 lifecycle policy missing', severity: 'warning', color: '#F59E0B' },
];

export default function DashboardSection() {
  const resources = useCountUp(247);
  const savings = useCountUp(4280);
  const health = useCountUp(87);
  const critical = useCountUp(3);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6">
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
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#10B981] to-[#7C3AED] bg-clip-text text-transparent mb-4"
        >
          Interactive Dashboard
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          Real-time visibility into your cloud infrastructure with actionable insights
          and comprehensive cost tracking.
        </motion.p>
      </motion.div>

      {/* Dashboard Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8"
      >
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Resources */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#94A3B8] mb-1">Resources</p>
            <p
              ref={resources.ref as React.RefObject<HTMLParagraphElement>}
              className="text-2xl font-bold text-[#10B981]"
            >
              {resources.value}
            </p>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#94A3B8] mb-1">Savings</p>
            <p
              ref={savings.ref as React.RefObject<HTMLParagraphElement>}
              className="text-2xl font-bold text-[#22D3EE]"
            >
              ${savings.value.toLocaleString()}
            </p>
          </div>

          {/* Health */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#94A3B8] mb-1">Health</p>
            <p
              ref={health.ref as React.RefObject<HTMLParagraphElement>}
              className="text-2xl font-bold text-[#7C3AED]"
            >
              {health.value}%
            </p>
          </div>

          {/* Critical */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#94A3B8] mb-1">Critical</p>
            <p
              ref={critical.ref as React.RefObject<HTMLParagraphElement>}
              className="text-2xl font-bold text-[#EF4444]"
            >
              {critical.value}
            </p>
          </div>
        </div>

        {/* Chart + Findings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="p-4 rounded-xl border border-white/10 bg-white/5"
          >
            <p className="text-sm text-[#94A3B8] mb-4">Cost by Service</p>
            <div className="space-y-3">
              {chartBars.map((bar, index) => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="text-xs text-[#94A3B8] w-14">{bar.label}</span>
                  <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: bar.color }}
                    />
                  </div>
                  <span className="text-xs text-[#F8FAFC] w-8">{bar.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Findings */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="p-4 rounded-xl border border-white/10 bg-white/5"
          >
            <p className="text-sm text-[#94A3B8] mb-4">Recent Findings</p>
            <div className="space-y-3">
              {recentFindings.map((finding) => (
                <motion.div
                  key={finding.id}
                  variants={fadeInUp}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: finding.color }}
                  />
                  <span className="text-sm text-[#F8FAFC]">{finding.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
