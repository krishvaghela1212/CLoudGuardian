import React from "react";
import { motion, useScroll } from "framer-motion";
import Hero from "./Hero";
import DiscoveryEngine from "./DiscoveryEngine";
import RuleEngine from "./RuleEngine";
import ExplanationEngine from "./ExplanationEngine";
import DashboardPreview from "./DashboardPreview";
import PlatformFeatures from "./PlatformFeatures";
import Architecture from "./Architecture";
import Footer from "./Footer";

const LandingPage = () => {
  const { scrollYProgress } = useScroll();

  return (
    <div className="bg-background min-h-screen text-text overflow-hidden selection:bg-secondary/30 font-sans transition-colors duration-300">
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary via-secondary to-accent z-100 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <main className="relative z-10">
        <Hero />
        <DiscoveryEngine />
        <RuleEngine />
        <ExplanationEngine />
        <DashboardPreview />
        <PlatformFeatures />
        <Architecture />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
