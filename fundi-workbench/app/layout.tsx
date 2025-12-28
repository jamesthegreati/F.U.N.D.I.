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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-ui bg-ide-panel-bg text-ide-text antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
