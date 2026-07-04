import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bleu profond, doré léger, gris clair — identité HonoronsDieu
        primary: {
          DEFAULT: '#1E3A5F',
          light: '#2C5282',
          dark: '#152B47',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E8D48B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
