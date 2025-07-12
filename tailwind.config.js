/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep using class-based dark mode for manual toggle + system fallback
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // ✅ Smooth skeleton pulse
      },
      colors: {
        skeleton: {
          light: '#e5e7eb', // ✅ Tailwind gray-200 (light theme)
          dark: '#374151',  // ✅ Tailwind gray-700 (dark theme)
        },
      },
    },
  },
  plugins: [],
}