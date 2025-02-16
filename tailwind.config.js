/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d0c7',
          300: '#a3b1a3',
          400: '#7d8f7d',
          500: '#637363',
          600: '#4c584c',
          700: '#3e463e',
          800: '#343934',
          900: '#2d312d',
        },
      },
    },
  },
  plugins: [],
};