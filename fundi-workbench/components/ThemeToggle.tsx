'use client'

import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg',
        'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text',
        'transition-all duration-200',
        className
      )}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
