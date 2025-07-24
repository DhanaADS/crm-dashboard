// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ✅ must be this (not "tailwindcss")
    autoprefixer: {},
  },
}