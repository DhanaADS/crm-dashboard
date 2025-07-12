/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Enables dark mode via class strategy
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // 👈 Ensures pulse animation
      },
      colors: {
        skeleton: {
          light: '#e5e7eb', // Tailwind gray-200
          dark: '#374151',  // Tailwind gray-700
        },
      },
    },
  },
  plugins: [],
}