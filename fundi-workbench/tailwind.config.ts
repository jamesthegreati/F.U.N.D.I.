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
        void: '#0B0F19',
        panel: '#151B2B',
        brass: '#D4AF37',
        'brass-dim': '#8B735B',
        electric: '#00F0FF',
        parchment: '#E2DBC8',
        error: '#CF352E',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'pro-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'pro': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'pro-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'pro-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'pro-glow': '0 0 0 1px rgba(245, 158, 11, 0.2), 0 0 20px rgba(245, 158, 11, 0.15)',
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
