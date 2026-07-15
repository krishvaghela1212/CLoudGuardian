import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { FEATURES } from '../../utils/constants';
import GlassCard from './GlassCard';

export default function FeaturesSection() {
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
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#10B981] to-[#22D3EE] bg-clip-text text-transparent mb-4"
        >
          Platform Features
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          A comprehensive suite of tools for cloud cost optimization, security, and observability.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
      >
        {FEATURES.map((feature, index) => (
          <GlassCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            color={feature.color}
            index={index}
          />
        ))}
      </motion.div>
    </section>
  );
}
