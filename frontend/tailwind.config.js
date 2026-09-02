/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1A3C34',
        'forest-deep': '#0F2A24',
        gold: '#C9963C',
        'gold-light': '#E8B84B',
        cream: '#FDF8F0',
        sage: '#E3EDE9',
        'pale-gold': '#F5E9CC',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        pill: '100px',
      },
    },
  },
  plugins: [],
}
