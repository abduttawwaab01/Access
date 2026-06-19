"use client"

import { useEffect, useRef, useCallback } from "react"

interface AntiCheatOptions {
  onTabSwitch?: (count: number) => void
  enabled?: boolean
}

export function useAntiCheat({ onTabSwitch, enabled = true }: AntiCheatOptions = {}) {
  const tabSwitchCount = useRef(0)
  const warned = useRef(false)

  const handleVisibility = useCallback(() => {
    if (document.hidden && enabled) {
      tabSwitchCount.current += 1
      if (onTabSwitch) onTabSwitch(tabSwitchCount.current)
    }
  }, [enabled, onTabSwitch])

  const handleBlur = useCallback(() => {
    if (enabled) {
      tabSwitchCount.current += 1
      if (onTabSwitch) onTabSwitch(tabSwitchCount.current)
    }
  }, [enabled, onTabSwitch])

  useEffect(() => {
    if (!enabled) return
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("blur", handleBlur)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("blur", handleBlur)
    }
  }, [enabled, handleVisibility, handleBlur])

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch {}
  }, [])

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen()
    }
  }, [])

  const disableCopyPaste = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!enabled) return
    const handler = (e: Event) => { e.preventDefault(); return false }
    document.addEventListener("contextmenu", handler)
    document.addEventListener("copy", handler)
    document.addEventListener("paste", handler)
    document.addEventListener("cut", handler)
    return () => {
      document.removeEventListener("contextmenu", handler)
      document.removeEventListener("copy", handler)
      document.removeEventListener("paste", handler)
      document.removeEventListener("cut", handler)
    }
  }, [enabled])

  return { tabSwitchCount, enterFullscreen, exitFullscreen }
}
