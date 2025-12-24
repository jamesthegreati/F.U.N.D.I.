import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Refined Minimalist "Pro" Palette
        pro: {
          bg: '#FAFAFA',
          'bg-subtle': '#F4F4F5',
          surface: '#FFFFFF',
          border: '#E4E4E7',
          'border-subtle': '#F4F4F5',
          text: '#18181B',
          'text-muted': '#71717A',
          'text-subtle': '#A1A1AA',
          // "Banana Pro" Yellow - sophisticated amber/gold accent
          accent: '#F59E0B',
          'accent-hover': '#D97706',
          'accent-subtle': 'rgba(245, 158, 11, 0.1)',
          // Status colors
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
        // Legacy colors for backward compatibility
        void: {
          DEFAULT: '#0B0F19',
          deep: '#05070A',
          light: '#1A1F2E',
        },
        panel: {
          DEFAULT: '#151B2B',
          dark: '#0E121D',
          light: '#1E2638',
        },
        brass: {
          DEFAULT: '#D4AF37',
          bright: '#F4D03F',
          dim: '#8B735B',
          dark: '#5D4037',
        },
        electric: {
          DEFAULT: '#00F0FF',
          dim: '#008B94',
          glow: 'rgba(0, 240, 255, 0.3)',
        },
        parchment: {
          DEFAULT: '#E2DBC8',
          dim: '#A69F8D',
          bright: '#FFF9E6',
        },
        error: {
          DEFAULT: '#CF352E',
          dim: '#8B231E',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'knurled': 'radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.15) 1px, transparent 0)',
        'scanlines': 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 50%)',
      },
      boxShadow: {
        'pro-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'pro': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'pro-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'pro-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'pro-glow': '0 0 0 1px rgba(245, 158, 11, 0.2), 0 0 20px rgba(245, 158, 11, 0.15)',
        'brass-glow': '0 0 15px rgba(212, 175, 55, 0.2)',
        'electric-glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'etched-in': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
        'etched-out': '0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'glow-ring': 'glow-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
