import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background gradients & grid */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03] dark:opacity-[0.05]" />
        
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-sm font-semibold tracking-wide"
        >
          Cloud Cost Optimization Platform
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-text mb-6"
        >
          Secure & Optimize Your Cloud <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
            With CloudGuardian AI
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg md:text-2xl text-muted mb-10 max-w-3xl mx-auto"
        >
          A deterministic FinOps Rule Engine powered by Groq AI. Scan AWS securely, discover resources, and optimize costs instantly.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={() => navigate('/scanner')}
            className="px-8 py-4 bg-secondary text-text font-semibold rounded-full hover:bg-opacity-90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Start Scanning Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
