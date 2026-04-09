"use client"

import * as React from "react"

type Theme = "light" | "dark"
type ThemeColor = "blue" | "green" | "purple" | "orange" | "red"

interface ThemeContextType {
  theme: Theme
  themeColor: ThemeColor
  compactMode: boolean
  setTheme: (theme: Theme) => void
  setThemeColor: (color: ThemeColor) => void
  setCompactMode: (compact: boolean) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light")
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>("blue")
  const [compactMode, setCompactModeState] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("hrms-theme") as Theme | null
    const savedColor = localStorage.getItem("hrms-theme-color") as ThemeColor | null
    const savedCompact = localStorage.getItem("hrms-compact-mode") === "true"

    if (savedTheme) setThemeState(savedTheme)
    if (savedColor) setThemeColorState(savedColor)
    setCompactModeState(savedCompact)
    setMounted(true)
  }, [])

  // Apply theme to document
  React.useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("hrms-theme", theme)
  }, [theme, mounted])

  // Apply theme color
  React.useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.setAttribute("data-theme-color", themeColor)
    localStorage.setItem("hrms-theme-color", themeColor)
  }, [themeColor, mounted])

  // Apply compact mode
  React.useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (compactMode) {
      root.classList.add("compact")
    } else {
      root.classList.remove("compact")
    }
    localStorage.setItem("hrms-compact-mode", String(compactMode))
  }, [compactMode, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
  }

  const setCompactMode = (compact: boolean) => {
    setCompactModeState(compact)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeColor, compactMode, setTheme, setThemeColor, setCompactMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
