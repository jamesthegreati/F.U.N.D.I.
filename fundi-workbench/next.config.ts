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

  // If you deploy to a GitHub Project Pages subdirectory (e.g. https://user.github.io/repo),
  // uncomment and set this to your repo name:
  // basePath: '/fundi-workbench',
}

export default nextConfig
