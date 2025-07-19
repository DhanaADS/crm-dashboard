/** @type {import('tailwindcss').Config} */
const { zinc } = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class', // ✅ Enable dark mode via class strategy
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zincGray: zinc,
        softWhite: '#FAFAFA',
        skeleton: {
          light: '#e5e7eb',
          dark: '#374151',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
  emailGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #06b6d4 100%)',
},
    },
  },
 