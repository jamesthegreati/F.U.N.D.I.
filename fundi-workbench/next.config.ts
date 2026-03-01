import type { NextConfig } from 'next'
import { fileURLToPath } from 'url'

const turbopackRoot = fileURLToPath(new URL('.', import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
  // Static export: generates HTML/CSS/JS for hosting on GitHub Pages.
  output: 'export',

  // GitHub Pages cannot run the Next.js Image Optimization API.
  images: {
    unoptimized: true,
  },

  // GitHub Pages project sites are served under /repo-name/
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

export default nextConfig
