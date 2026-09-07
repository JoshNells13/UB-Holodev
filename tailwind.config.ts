import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        mono: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b'
        },
        forest: {
          50: '#f2f8f5',
          100: '#e1efe8',
          200: '#c5dfd3',
          300: '#9ac5b3',
          400: '#68a48c',
          500: '#43846c',
          600: '#306955',
          700: '#265344',
          800: '#1e4337',
          900: '#15332a',
          950: '#0c221b'
        },
        gold: {
          50: '#fdfaf2',
          100: '#f9f3e0',
          200: '#f2e4bd',
          300: '#e8ce91',
          400: '#ddb35f',
          500: '#d49b2a',
          600: '#bf8420',
          700: '#9c651c',
          800: '#7e501d',
          900: '#67421c',
          950: '#3c230c'
        },
        cream: {
          50: '#fdfcf9',
          100: '#fbf9f5',
          200: '#f6f3eb',
          300: '#ede8db',
          400: '#ded5bf',
          500: '#c8b99c'
        }
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'clean-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'clean-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        'premium': '0 10px 30px -5px rgba(12, 34, 27, 0.08), 0 4px 10px -2px rgba(12, 34, 27, 0.04)',
        'premium-hover': '0 20px 40px -10px rgba(12, 34, 27, 0.14), 0 8px 16px -4px rgba(12, 34, 27, 0.06)',
        'gold-glow': '0 0 20px rgba(212, 155, 42, 0.35)'
      }
    }
  },
  plugins: []
} satisfies Config
