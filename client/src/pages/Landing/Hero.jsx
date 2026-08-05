import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, CloudCog, ChevronRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 bg-background z-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-text)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-text)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03] dark:opacity-[0.04] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        
        {/* Glowing Orbs - adjusted for elegant theme with warm accents */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 md:left-1/4 w-[45rem] h-[45rem] bg-[#D9D0B4] rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 md:-bottom-1/4 -right-1/4 md:right-1/4 w-[40rem] h-[40rem] bg-[#A98E63] rounded-full blur-[130px] pointer-events-none" 
        />
      </div>

      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md"
          >
            <span className="text-primary dark:text-accent text-xs tracking-[0.2em] font-medium uppercase">
              Discover Your Inner Cloud
            </span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-serif tracking-tight text-text mb-6 leading-none relative"
          >
            Cloud <br className="hidden md:block" />
            <motion.span 
              className="italic font-light text-transparent bg-clip-text bg-[linear-gradient(90deg,var(--color-primary),#D9D0B4,var(--color-text),#D9D0B4,var(--color-primary))] dark:bg-[linear-gradient(90deg,#D9D0B4,var(--color-primary),#F5F3EB,var(--color-primary),#D9D0B4)] bg-[length:200%_auto]"
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              Guardian
            </motion.span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed tracking-wide font-light"
          >
            An elegant, deterministic FinOps Engine. Scan AWS securely, discover resources instantly, and optimize with precision.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mt-4"
          >
            <button 
              onClick={() => navigate('/scanner')}
              className="group relative flex items-center justify-center gap-2 px-10 py-4 bg-primary text-background dark:bg-accent dark:text-primary font-medium text-sm tracking-[0.1em] uppercase rounded-full overflow-hidden transition-all hover:scale-105 w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Scanning
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-black/10 dark:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button 
              className="group flex items-center justify-center gap-2 px-10 py-4 bg-transparent border border-primary/20 dark:border-accent/30 hover:border-primary dark:hover:border-accent text-text font-medium text-sm tracking-[0.1em] uppercase rounded-full transition-all w-full sm:w-auto"
            >
              Learn More
            </button>
          </motion.div>

          {/* Feature Highlights below CTA */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
          >
            {[
              { icon: ShieldCheck, title: "Deterministic Security", desc: "Rule-based analysis with absolute precision." },
              { icon: Zap, title: "Instant Discovery", desc: "Real-time, elegant AWS resource mapping." },
              { icon: CloudCog, title: "Cost Optimization", desc: "Actionable FinOps recommendations." }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center p-8 rounded-none border-t border-primary/10 dark:border-accent/10 hover:border-primary/40 transition-colors">
                <div className="mb-6 text-primary dark:text-accent">
                  <feature.icon className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-text font-serif text-xl mb-3">{feature.title}</h3>
                <p className="text-muted text-sm text-center leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
