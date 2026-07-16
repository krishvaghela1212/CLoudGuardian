import React from 'react';
import { motion } from 'framer-motion';
import { Database, Server, Box, Cpu } from 'lucide-react';

const DiscoveryEngine = () => {
  const resources = [
    { icon: <Server className="w-8 h-8" />, label: 'EC2 Instance', delay: 0 },
    { icon: <Box className="w-8 h-8" />, label: 'S3 Bucket', delay: 0.2 },
    { icon: <Cpu className="w-8 h-8" />, label: 'Lambda Func', delay: 0.4 },
    { icon: <Database className="w-8 h-8" />, label: 'RDS Cluster', delay: 0.6 },
  ];

  return (
    <section className="min-h-screen relative py-24 flex items-center bg-surface border-y border-muted/10 overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Cloud Discovery Engine</h2>
          <p className="text-xl text-muted">Real-time AWS infrastructure scanning and mapping</p>
        </motion.div>
        
        <div className="h-[500px] relative rounded-2xl border border-muted/20 bg-background/50 backdrop-blur flex items-center justify-center overflow-hidden p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between w-full h-full">
            
            {/* Left side AWS Cloud */}
            <div className="flex flex-col space-y-4 w-1/4">
              {resources.map((res, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: res.delay, duration: 0.5 }}
                  className="bg-surface border border-muted/20 p-4 rounded-lg flex items-center space-x-4 shadow-md z-20 relative"
                >
                  <div className="text-primary">{res.icon}</div>
                  <span className="font-mono text-sm text-text">{res.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Middle Data Streams */}
            <div className="flex-1 h-full relative flex items-center justify-center">
              {[0, 1, 2, 3].map((line, i) => (
                <div key={line} className="absolute left-0 right-0 h-[2px] bg-muted/10" style={{ top: `${25 + i * 16}%` }}>
                  <motion.div
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, ease: 'linear' }}
                    className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-secondary to-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Right side CloudGuardian Engine */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-1/4 flex items-center justify-center relative z-20"
            >
              <div className="w-48 h-48 rounded-full border border-primary bg-primary/5 flex items-center justify-center shadow-[0_0_40px_rgba(var(--color-primary),0.1)] backdrop-blur-md">
                <div className="text-center">
                  <Cpu className="w-12 h-12 text-primary mx-auto mb-2" />
                  <span className="font-bold text-sm tracking-widest text-text uppercase">Discovery Core</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoveryEngine;
