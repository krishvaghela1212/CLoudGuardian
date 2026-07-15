/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F14',
        surface: '#111827',
        primary: '#10B981',
        secondary: '#22D3EE',
        accent: '#7C3AED',
        warning: '#F59E0B',
        critical: '#EF4444',
        text: '#F8FAFC',
        muted: '#94A3B8',
      },
    },
  },
  plugins: [],
}
