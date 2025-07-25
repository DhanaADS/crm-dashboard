module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  rules: {
    // ✅ Enable case-sensitive import checks
    'import/no-unresolved': ['error', { caseSensitive: true }]
  },
};