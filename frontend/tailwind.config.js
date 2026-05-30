/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './types/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Neutral near-black canvas
        ink: '#0a0a0b',
        surface: '#101012',
        'surface-2': '#161618',
        'surface-3': '#1f1f22',

        // Text
        fg: '#f4f4f5',
        muted: '#a1a1aa',
        faint: '#6a6a73',

        // "Accent" remapped to monochrome — bright = active/on
        lime: {
          200: '#fafafa',
          300: '#ededf0',
          400: '#d4d4d8',
          500: '#a1a1aa',
          600: '#71717a',
          700: '#52525b',
          DEFAULT: '#d4d4d8',
        },
        // Tally red — the single hue (live / rec / leave / danger)
        tally: {
          300: '#ff9b9e',
          400: '#ff6b6f',
          500: '#ff4d52',
          600: '#e23b40',
          DEFAULT: '#ff4d52',
        },

        primary: {
          50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
          400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
          800: '#27272a', 900: '#18181b',
        },
        accent: { 500: '#a1a1aa', 600: '#71717a' },
      },
      backgroundImage: {
        'lime-sheen': 'linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)',
        'grid-fine':
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 26px 60px -32px rgba(0,0,0,0.9)',
        live: '0 8px 30px -10px rgba(255,255,255,0.12)',
        tally: '0 8px 30px -8px rgba(255,77,82,0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'tally-pulse': 'tallyPulse 1.6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'spin-slow': 'spin 16s linear infinite',
        eq1: 'eq 0.9s ease-in-out infinite',
        eq2: 'eq 0.7s ease-in-out infinite 0.15s',
        eq3: 'eq 1.1s ease-in-out infinite 0.3s',
        eq4: 'eq 0.8s ease-in-out infinite 0.45s',
      },
      keyframes: {
        fadeUp: {
          '0%': { transform: 'translateY(22px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        tallyPulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255,77,82,0.5)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 0 6px rgba(255,77,82,0)' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        eq: { '0%,100%': { transform: 'scaleY(0.35)' }, '50%': { transform: 'scaleY(1)' } },
      },
    },
  },
  plugins: [],
}
