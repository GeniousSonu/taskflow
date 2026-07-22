'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'light'
export type AccentColor = { name: string; hex: string; hsl: string }

export const ACCENT_COLORS: AccentColor[] = [
  { name: 'Indigo', hex: '#6366f1', hsl: '239 84% 67%' },
  { name: 'Blue', hex: '#3b82f6', hsl: '217 91% 60%' },
  { name: 'Emerald', hex: '#10b981', hsl: '160 84% 39%' },
  { name: 'Purple', hex: '#8b5cf6', hsl: '262 83% 58%' },
  { name: 'Amber', hex: '#f59e0b', hsl: '38 92% 50%' },
  { name: 'Rose', hex: '#f43f5e', hsl: '347 89% 61%' },
]

interface ThemeContextType {
  theme: ThemeMode
  accent: AccentColor
  setTheme: (theme: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  accent: ACCENT_COLORS[0],
  setTheme: () => {},
  setAccent: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark')
  const [accent, setAccentState] = useState<AccentColor>(ACCENT_COLORS[0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem('ibworks_theme') as ThemeMode) || 'dark'
    const savedAccentHex = localStorage.getItem('ibworks_accent')
    const savedAccent = ACCENT_COLORS.find(c => c.hex === savedAccentHex) || ACCENT_COLORS[0]

    setThemeState(savedTheme)
    setAccentState(savedAccent)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    root.style.setProperty('--accent-hex', accent.hex)
    root.style.setProperty('--accent-hsl', accent.hsl)
    localStorage.setItem('ibworks_theme', theme)
    localStorage.setItem('ibworks_accent', accent.hex)
  }, [theme, accent, mounted])

  const setTheme = (mode: ThemeMode) => setThemeState(mode)
  const setAccent = (acc: AccentColor) => setAccentState(acc)

  return (
    <ThemeContext.Provider value={{ theme, accent, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
