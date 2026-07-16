import React from 'react';
import { motion } from 'framer-motion';

const ExplanationEngine = () => {
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">AI Explanation Engine</h2>
          <p className="text-xl text-muted">Powered by Groq AI for human-readable recommendations</p>
        </motion.div>
        
        <div className="h-[400px] rounded-2xl bg-background border border-muted/10 p-8 font-mono text-sm shadow-xl">
          <p className="text-accent mb-4">&gt; Analyzing findings...</p>
          <p className="text-secondary mb-4">Problem: Unused EBS Volume detected</p>
          <p className="text-primary mb-4">Recommendation: Delete volume vol-0abcd1234 to save $45/mo</p>
          <p className="text-muted">Generated CLI Command:</p>
          <div className="mt-2 p-4 bg-surface rounded border border-muted/10 text-text shadow-inner">
            aws ec2 delete-volume --volume-id vol-0abcd1234
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExplanationEngine;
