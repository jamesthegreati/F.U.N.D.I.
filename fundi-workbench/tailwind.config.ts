import type { Config } from 'tailwindcss'

const withAlpha = (cssVarName: string) => `rgb(var(${cssVarName}) / <alpha-value>)`

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
          // Compatibility aliases (some components use these)
          bg: withAlpha('--ide-panel-bg'),
          panel: withAlpha('--ide-panel-surface'),
          // Canvas/Stage area
          'canvas-bg': withAlpha('--ide-canvas-bg'),
          'canvas-surface': withAlpha('--ide-canvas-surface'),
          'canvas-grid': withAlpha('--ide-canvas-grid'),
          // Panel system
          'panel-bg': withAlpha('--ide-panel-bg'),
          'panel-surface': withAlpha('--ide-panel-surface'),
          'panel-hover': withAlpha('--ide-panel-hover'),
          // Borders with hierarchy
          'border': withAlpha('--ide-border'),
          'border-subtle': withAlpha('--ide-border-subtle'),
          'border-focus': withAlpha('--ide-border-focus'),
          // Text hierarchy
          'text': withAlpha('--ide-text'),
          'text-muted': withAlpha('--ide-text-muted'),
          'text-subtle': withAlpha('--ide-text-subtle'),
          // Accent - Electric Amber
          'accent': withAlpha('--ide-accent'),
          'accent-hover': withAlpha('--ide-accent-hover'),
          'accent-dim': withAlpha('--ide-accent-dim'),
          'accent-glow': `rgb(var(--ide-accent) / 0.25)`,
          // Status
          'success': withAlpha('--ide-success'),
          'success-dim': withAlpha('--ide-success-dim'),
          'error': withAlpha('--ide-error'),
          'error-dim': withAlpha('--ide-error-dim'),
          'warning': withAlpha('--ide-warning'),
          'info': withAlpha('--ide-info'),
        },
        // Refined Minimalist "Pro" Palette (light mode compat)
        pro: {
          bg: withAlpha('--pro-bg'),
          'bg-subtle': withAlpha('--pro-bg-subtle'),
          surface: withAlpha('--pro-surface'),
          border: withAlpha('--pro-border'),
          'border-subtle': withAlpha('--pro-border-subtle'),
          text: withAlpha('--pro-text'),
          'text-muted': withAlpha('--pro-text-muted'),
          'text-subtle': withAlpha('--pro-text-subtle'),
          accent: withAlpha('--pro-accent'),
          'accent-hover': withAlpha('--pro-accent-hover'),
          'accent-subtle': `rgb(var(--pro-accent) / 0.1)`,
          success: withAlpha('--pro-success'),
          error: withAlpha('--pro-error'),
          warning: withAlpha('--pro-accent'),
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
