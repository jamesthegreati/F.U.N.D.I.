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
        heading: ['var(--font-heading)'],
        ui: ['var(--font-ui)'],
        mono: ['var(--font-mono)'],
      },
      backgroundImage: {
        'knurled': 'radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.15) 1px, transparent 0)',
        'scanlines': 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 50%)',
      },
      boxShadow: {
        'brass-glow': '0 0 15px rgba(212, 175, 55, 0.2)',
        'electric-glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'etched-in': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
        'etched-out': '0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
