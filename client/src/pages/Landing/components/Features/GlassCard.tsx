import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  index: number;
}

export default function GlassCard({ title, description, icon, color, index }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${color}33` }}
      animate={{ y: [0, -8, 0] }}
      className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      style={{ transition: 'box-shadow 0.3s ease' }}
    >
      {/* Independent floating animation layer */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.4,
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold mb-4 border border-white/10"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{title}</h3>
        <p className="text-sm text-[#94A3B8]">{description}</p>
      </motion.div>
    </motion.div>
  );
}
