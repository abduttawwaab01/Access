export const defaultTheme = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  accentHover: "#d97706",
  gradientFrom: "#6366f1",
  gradientVia: "#8b5cf6",
  gradientTo: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
}

export type ThemeColors = typeof defaultTheme

export function applyTheme(colors: Partial<ThemeColors>) {
  const root = document.documentElement
  const merged = { ...defaultTheme, ...colors }
  Object.entries(merged).forEach(([key, value]) => {
    root.style.setProperty(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value)
  })
}
