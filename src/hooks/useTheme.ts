"use client"

import { useCallback, useEffect, useState } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("access-theme")
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("access-theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("access-theme", "light")
      }
      return next
    })
  }, [])

  return { isDark, toggleTheme }
}
