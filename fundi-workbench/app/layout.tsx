import type { Metadata } from 'next'

import '@xyflow/react/dist/style.css'
import './globals.css'

export const metadata: Metadata = {
  title: "FUNDI - IoT Workbench",
  description: "Professional IoT Design Platform for Nano Banana Pro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root {
            --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
          }
        `}</style>
      </head>
      <body className="font-ui bg-pro-bg text-pro-text antialiased">
        {children}
      </body>
    </html>
  );
}
