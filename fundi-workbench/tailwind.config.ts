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
        void: '#050510',
        'deep-void': '#010108',
        steel: '#1a1a2e',
        'steel-light': '#2a2a3e',
        'steel-dark': '#0f0f1e',
        'neon-cyan': '#00fff5',
        'neon-magenta': '#ff00ff',
        'neon-blue': '#0080ff',
        'neon-orange': '#ff6b00',
        'neon-green': '#00ff88',
        'electric-glow': '#00ffff',
        warning: '#ffaa00',
        danger: '#ff0055',
        success: '#00ff88',
      },
      fontFamily: {
        heading: ['Orbitron', 'monospace'],
        ui: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'float-drift': 'float-drift 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'holo-rotate': 'holo-rotate 4s linear infinite',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 255, 245, 0.3)',
        'glow-magenta': '0 0 20px rgba(255, 0, 255, 0.3)',
        'foundry': '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(0, 255, 245, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
