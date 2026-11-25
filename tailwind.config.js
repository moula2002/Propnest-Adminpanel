/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B2246',
          hover: '#133160',
          light: '#EEF3FA',
          dark: '#071731',
        },
        navy: {
          950: '#071731',
          900: '#0B2246',
          800: '#133160',
          700: '#1B417A',
          50: '#EEF3FA',
        },
        secondary: {
          DEFAULT: '#F5820D',
          hover: '#DC6F05',
          light: '#FFF4E8',
        },
        brandOrange: {
          DEFAULT: '#F5820D',
          hover: '#DC6F05',
          light: '#FFF4E8',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
};

