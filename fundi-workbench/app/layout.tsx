import type { Metadata } from 'next'
import { Cinzel, Inter, JetBrains_Mono } from 'next/font/google'

import '@xyflow/react/dist/style.css'
import './globals.css'

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${cinzel.variable} ${inter.variable} ${jetbrainsMono.variable} font-ui bg-void text-parchment antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
