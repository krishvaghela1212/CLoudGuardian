import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';

const RuleEngine = () => {
  const cards = [
    { title: 'Idle EC2 Instances', icon: <Clock className="w-8 h-8 text-primary" />, desc: 'Identified 14 idle instances running for > 30 days.' },
    { title: 'Unused EBS Volumes', icon: <TrendingDown className="w-8 h-8 text-accent" />, desc: 'Found 5 unattached volumes taking up storage costs.' },
    { title: 'Missing Lifecycle', icon: <AlertTriangle className="w-8 h-8 text-warning" />, desc: 'S3 buckets missing lifecycle policies for older objects.' }
  ];

  return (
    <section className="min-h-screen relative py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">FinOps Rule Engine</h2>
          <p className="text-xl text-muted">Deterministic evaluation for maximum cost savings</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, rotateY: 90 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8, type: 'spring' }}
              whileHover={{ scale: 1.05, rotateY: 10, rotateX: 10 }}
              className="h-64 rounded-xl border border-muted/20 bg-surface shadow-xl relative overflow-hidden group p-6 flex flex-col justify-between"
            >
              {/* Holographic sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              
              <div className="relative z-10">
                <div className="mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-text mb-2">{card.title}</h3>
                <p className="text-muted">{card.desc}</p>
              </div>
              <div className="text-primary text-sm font-mono mt-4 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                &lt;Analyze /&gt;
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RuleEngine;
