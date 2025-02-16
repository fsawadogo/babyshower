/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
          '50': 'color-mix(in srgb, var(--color-primary) 5%, white)',
          '100': 'color-mix(in srgb, var(--color-primary) 10%, white)',
          '200': 'color-mix(in srgb, var(--color-primary) 20%, white)',
          '300': 'color-mix(in srgb, var(--color-primary) 30%, white)',
          '400': 'color-mix(in srgb, var(--color-primary) 40%, white)',
          '500': 'color-mix(in srgb, var(--color-primary) 50%, white)',
          '600': 'color-mix(in srgb, var(--color-primary) 60%, white)',
          '700': 'color-mix(in srgb, var(--color-primary) 70%, white)',
          '800': 'color-mix(in srgb, var(--color-primary) 80%, white)',
          '900': 'color-mix(in srgb, var(--color-primary) 90%, white)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)',
          light: 'var(--color-secondary-light)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
          light: 'var(--color-accent-light)',
        },
        background: 'var(--color-background)',
        text: {
          DEFAULT: 'var(--color-text)',
          dark: 'var(--color-text-dark)',
          light: 'var(--color-text-light)',
        },
      },
      ringColor: {
        primary: 'var(--color-primary)',
      },
    },
  },
  plugins: [],
};