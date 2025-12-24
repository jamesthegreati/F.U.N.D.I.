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
        // IDE Semantic Color System
        ide: {
          // Canvas/Stage area
          'canvas-bg': '#1a1a1a',
          'canvas-surface': '#242424',
          'canvas-grid': '#2d2d2d',
          // Panel system
          'panel-bg': '#0d0d0d',
          'panel-surface': '#161616',
          'panel-hover': '#1f1f1f',
          // Borders with hierarchy
          'border': '#2a2a2a',
          'border-subtle': '#222222',
          'border-focus': '#404040',
          // Text hierarchy
          'text': '#e5e5e5',
          'text-muted': '#a3a3a3',
          'text-subtle': '#737373',
          // Accent - Electric Amber
          'accent': '#f59e0b',
          'accent-hover': '#fbbf24',
          'accent-dim': '#b45309',
          'accent-glow': 'rgba(245, 158, 11, 0.25)',
          // Status
          'success': '#22c55e',
          'success-dim': '#166534',
          'error': '#ef4444',
          'error-dim': '#991b1b',
          'warning': '#eab308',
          'info': '#3b82f6',
        },
        // Refined Minimalist "Pro" Palette (light mode compat)
        pro: {
          bg: '#FAFAFA',
          'bg-subtle': '#F4F4F5',
          surface: '#FFFFFF',
          border: '#E4E4E7',
          'border-subtle': '#F4F4F5',
          text: '#18181B',
          'text-muted': '#71717A',
          'text-subtle': '#A1A1AA',
          accent: '#F59E0B',
          'accent-hover': '#D97706',
          'accent-subtle': 'rgba(245, 158, 11, 0.1)',
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
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'ide-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'ide': '0 2px 8px rgba(0, 0, 0, 0.5)',
        'ide-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'ide-glow': '0 0 0 1px rgba(245, 158, 11, 0.3), 0 0 24px rgba(245, 158, 11, 0.15)',
        'ide-success-glow': '0 0 0 2px rgba(34, 197, 94, 0.3), 0 0 24px rgba(34, 197, 94, 0.2)',
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
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'glow-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.1)' },
        },
        'sim-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.5), inset 0 0 0 1px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(34, 197, 94, 0.3), inset 0 0 0 1px rgba(34, 197, 94, 0.5)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'glow-ring': 'glow-ring 2s ease-in-out infinite',
        'sim-glow': 'sim-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
