import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-1000 inline-flex items-center justify-center rounded-full border border-muted/20 bg-surface/90 p-3 text-sm text-text shadow-lg shadow-slate-900/10 transition hover:border-secondary hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary/50"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-secondary" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;
