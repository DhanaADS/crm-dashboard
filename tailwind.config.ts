// tailwind.config.ts
import { type Config } from 'tailwindcss'
import { zinc } from 'tailwindcss/colors'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/styles/globals.css',
    './node_modules/@headlessui/react/**/*.js',
    './node_modules/@heroicons/react/**/*.js',
  ],
  safelist: [
    'bg-green-600',
    'bg-green-700',
    'text-white',
    'rounded-lg',
    'shadow-lg',
    'p-2',
    'px-4',
    'py-2',
    'w-full',
    'text-left',
    '!bg-red-600',
    '!bg-green-500',
    '!bg-sky-500',
    '!bg-zinc-800',
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
      borderRadius: {
        lg: '0.625rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        emailGradient:
          'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #06b6d4 100%)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/line-clamp'),
  ],
}

export default config