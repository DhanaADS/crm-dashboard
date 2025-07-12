/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ VERY IMPORTANT
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}