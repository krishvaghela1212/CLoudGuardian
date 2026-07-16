import React from 'react';
import { motion } from 'framer-motion';

const PlatformFeatures = () => {
  const features = [
    "AWS STS Authentication",
    "IAM Role Security",
    "Cloud Discovery Engine",
    "FinOps Rule Engine",
    "Groq AI Analysis",
    "Socket.IO Live Progress",
    "MongoDB History",
    "Interactive Reports"
  ];

  return (
    <section className="min-h-screen relative py-24 bg-surface border-y border-muted/10">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Platform Features</h2>
          <p className="text-xl text-muted">Enterprise-grade architecture and capabilities</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl border border-muted/20 bg-background hover:bg-primary/5 hover:border-primary/50 transition-colors shadow-md flex items-center justify-center text-center cursor-default h-32"
            >
              <span className="font-semibold text-text">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
