import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
