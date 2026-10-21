/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0d10',
        surface: 'rgba(255,255,255,0.04)',
        // Accent colors follow the CSS variables set by ColorThemeService,
        // so the color picker updates every accent utility at runtime.
        accent: {
          DEFAULT: 'rgba(var(--accent-rgb), <alpha-value>)',
          400: 'rgba(var(--accent-light-rgb), <alpha-value>)',
          500: 'rgba(var(--accent-rgb), <alpha-value>)',
          600: 'rgba(var(--accent-dark-rgb), <alpha-value>)',
        },
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 20px rgba(var(--accent-rgb), 0.35)',
        'glow-lg': '0 0 40px rgba(var(--accent-rgb), 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(var(--accent-rgb), 0)' },
          '50%': { boxShadow: '0 0 14px rgba(var(--accent-rgb), 0.6)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'scroll-hint': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(10px)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite',
        'scroll-hint': 'scroll-hint 1.8s ease-out infinite',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
