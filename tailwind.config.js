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
        accent: {
          400: '#33ff66', // matrix green light
          500: '#00ff41', // matrix green
          600: '#00cc33', // matrix green dark
        },
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 20px rgba(0, 255, 65, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0, 255, 65, 0.0)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 255, 65, 0.35)' },
        },
        'text-glow': {
          '0%, 100%': { 
            textShadow: '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)',
          },
          '50%': { 
            textShadow: '0 0 20px rgba(0, 255, 65, 0.8), 0 0 30px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 255, 65, 0.3)',
          },
        },
        'neon-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(0, 255, 65, 0.3), 0 0 10px rgba(0, 255, 65, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 15px rgba(0, 255, 65, 0.6), 0 0 25px rgba(0, 255, 65, 0.4), 0 0 35px rgba(0, 255, 65, 0.2)',
          },
        },
        'slide-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'typewriter': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}

