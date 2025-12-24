'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    // Update the html element's class when theme changes
    const root = document.documentElement
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light'
    
    // Only update if theme actually changed
    if (currentTheme !== theme) {
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
    }
  }, [theme])

  return <>{children}</>
}
