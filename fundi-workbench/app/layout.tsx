import type { Metadata } from 'next'

import '@xyflow/react/dist/style.css'
import './globals.css'

export const metadata: Metadata = {
  title: "FUNDI - IoT Workbench",
  description: "Industrial Alchemist IoT Design Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-ui bg-void text-neon-cyan antialiased">
        {children}
      </body>
    </html>
  );
}
