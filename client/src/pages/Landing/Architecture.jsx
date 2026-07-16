import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { User, Shield, Search, Cpu, Brain, LayoutDashboard } from 'lucide-react';

const Architecture = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-50%"]);

  const steps = [
    { id: 1, name: "User Auth", icon: <User className="w-8 h-8" />, desc: "Secure SSO & IAM" },
    { id: 2, name: "STS Assume Role", icon: <Shield className="w-8 h-8" />, desc: "Temporary Credentials" },
    { id: 3, name: "Discovery Engine", icon: <Search className="w-8 h-8" />, desc: "Scan AWS Resources" },
    { id: 4, name: "FinOps Rules", icon: <Cpu className="w-8 h-8" />, desc: "Deterministic Logic" },
    { id: 5, name: "Groq AI", icon: <Brain className="w-8 h-8" />, desc: "LLM Explanation" },
    { id: 6, name: "Dashboard", icon: <LayoutDashboard className="w-8 h-8" />, desc: "Live Reporting" },
  ];

  return (
    <section ref={targetRef} className="h-[200vh] relative bg-background">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        
        <motion.div className="text-center mb-16 absolute top-24 w-full">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Architecture</h2>
          <p className="text-xl text-muted">A secure and scalable horizontal pipeline</p>
        </motion.div>
        
        <motion.div style={{ x }} className="flex gap-8 px-4 md:px-24 w-[200vw]">
          {steps.map((step, i) => (
            <div key={step.id} className="w-[300px] shrink-0 group relative">
              
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-1/2 left-[50%] w-full h-1 bg-muted/20 -z-10 group-hover:bg-secondary/50 transition-colors duration-500">
                  <div className="h-full bg-secondary w-0 group-hover:w-full transition-all duration-1000 ease-in-out" />
                </div>
              )}

              <div className="bg-surface border border-muted/20 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:border-secondary transition-colors h-full">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-text">{step.name}</h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
};

export default Architecture;
