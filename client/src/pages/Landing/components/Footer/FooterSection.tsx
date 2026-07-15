import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const navColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Scanner', href: '/scanner' },
      { label: 'Copilot', href: '/copilot' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: 'https://docs.cloudguardian.ai', external: true },
      { label: 'API Reference', href: 'https://api.cloudguardian.ai', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: 'https://cloudguardian.ai/about', external: true },
      { label: 'Contact', href: 'https://cloudguardian.ai/contact', external: true },
    ],
  },
];

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/cloudguardian-ai',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/cloudguardian-ai',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

// Generate grid dots for animated background
const GRID_DOTS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  delay: Math.random() * 3,
}));

export default function FooterSection() {
  return (
    <footer className="relative py-20 px-6 border-t border-white/5 overflow-hidden">
      {/* Animated dot-grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-8 p-12 opacity-20">
          {GRID_DOTS.map((dot) => (
            <motion.div
              key={dot.id}
              className="w-1 h-1 rounded-full bg-[#94A3B8]"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: dot.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer Content */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Top Row: Logo + Nav Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo / Brand */}
          <motion.div variants={fadeInUp} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* Shield Icon */}
              <svg
                className="w-8 h-8 text-[#10B981]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              <span className="text-lg font-bold text-[#F8FAFC]">CloudGuardian AI</span>
            </div>
            <p className="text-sm text-[#94A3B8] max-w-xs">
              AI-powered cloud cost optimization and security platform for modern engineering teams.
            </p>
          </motion.div>

          {/* Nav Columns */}
          {navColumns.map((column) => (
            <motion.div key={column.title} variants={fadeInUp}>
              <h4 className="text-sm font-semibold text-[#F8FAFC] mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Social Links */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </motion.div>

            {/* Copyright */}
            <motion.p variants={fadeInUp} className="text-xs text-[#94A3B8]">
              © {new Date().getFullYear()} CloudGuardian AI. All rights reserved.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
