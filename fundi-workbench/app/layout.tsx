import type { Metadata } from 'next'

import '@xyflow/react/dist/style.css'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

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
    // suppressHydrationWarning is needed because the theme class may differ
    // between server (dark) and client (user's preference) on initial render
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-ui bg-ide-panel-bg text-ide-text antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
