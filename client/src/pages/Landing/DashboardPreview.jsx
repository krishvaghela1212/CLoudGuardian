import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Zap, DollarSign } from 'lucide-react';

const data = [
  { name: 'Jan', cost: 4000, optimized: 2400 },
  { name: 'Feb', cost: 3000, optimized: 1398 },
  { name: 'Mar', cost: 2000, optimized: 9800 },
  { name: 'Apr', cost: 2780, optimized: 3908 },
  { name: 'May', cost: 1890, optimized: 4800 },
  { name: 'Jun', cost: 2390, optimized: 3800 },
  { name: 'Jul', cost: 3490, optimized: 4300 },
];

const DashboardPreview = () => {
  return (
    <section className="min-h-screen relative py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Interactive Dashboard</h2>
          <p className="text-xl text-muted">Complete visibility into your cloud operations</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full rounded-2xl border border-muted/20 bg-surface shadow-2xl p-6 lg:p-8 relative overflow-hidden"
        >
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-xl border border-muted/10 bg-background flex items-center space-x-4">
              <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Savings</p>
                <p className="text-2xl font-bold text-text">$12,450</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-muted/10 bg-background flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg text-accent">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted">Resources Optimized</p>
                <p className="text-2xl font-bold text-text">342</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-muted/10 bg-background flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted">Security Score</p>
                <p className="text-2xl font-bold text-text">98/100</p>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="h-[400px] w-full mt-4">
            <p className="text-sm font-semibold mb-4 text-text">Cost Optimization Trend</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-critical)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-critical)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" opacity={0.2} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-muted)' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Area type="monotone" dataKey="cost" stroke="var(--color-critical)" fillOpacity={1} fill="url(#colorCost)" />
                <Area type="monotone" dataKey="optimized" stroke="var(--color-secondary)" fillOpacity={1} fill="url(#colorOpt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
