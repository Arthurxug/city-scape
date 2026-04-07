/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0A0A0A',
          surface: '#111111',
          elevated: '#1A1A1A',
        },
        gold: {
          DEFAULT: '#C8A96E',
          muted: '#9A7D4E',
          faint: 'rgba(200,169,110,0.08)',
        },
        danger: '#E05252',
        success: '#4CAF7D',
        text: {
          primary: '#F5F5F5',
          muted: '#888888',
          faint: '#555555',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        label: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 12px rgba(200, 169, 110, 0.4)',
        'gold-glow-lg': '0 0 24px rgba(200, 169, 110, 0.3)',
        'success-glow': '0 0 10px rgba(76, 175, 125, 0.5)',
        'danger-glow': '0 0 10px rgba(224, 82, 82, 0.5)',
        'white-glow': '0 0 10px rgba(248, 248, 248, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderColor: {
        gold: '#C8A96E',
      },
    },
  },
  plugins: [],
};
