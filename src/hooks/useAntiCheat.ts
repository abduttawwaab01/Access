"use client"

import { useEffect, useRef, useCallback } from "react"

interface AntiCheatOptions {
  onTabSwitch?: (count: number) => void
  onFullscreenExit?: () => void
  enabled?: boolean
  allowCopyPaste?: boolean
}

export function useAntiCheat({ onTabSwitch, onFullscreenExit, enabled = true, allowCopyPaste = false }: AntiCheatOptions = {}) {
  const tabSwitchCount = useRef(0)
  const lastEvent = useRef(0)

  const handleVisibility = useCallback(() => {
    if (!enabled) return
    const now = Date.now()
    if (now - lastEvent.current < 500) return
    lastEvent.current = now
    if (document.hidden) {
      tabSwitchCount.current += 1
      if (onTabSwitch) onTabSwitch(tabSwitchCount.current)
    }
  }, [enabled, onTabSwitch])

  const handleBlur = useCallback(() => {
    if (!enabled) return
    const now = Date.now()
    if (now - lastEvent.current < 500) return
    lastEvent.current = now
    tabSwitchCount.current += 1
    if (onTabSwitch) onTabSwitch(tabSwitchCount.current)
  }, [enabled, onTabSwitch])

  const handleFullscreenChange = useCallback(() => {
    if (!enabled) return
    if (!document.fullscreenElement && onFullscreenExit) {
      onFullscreenExit()
    }
  }, [enabled, onFullscreenExit])

  useEffect(() => {
    if (!enabled) return
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [enabled, handleVisibility, handleBlur, handleFullscreenChange])

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

  useEffect(() => {
    if (!enabled || allowCopyPaste) return
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
  }, [enabled, allowCopyPaste])

  return { tabSwitchCount, enterFullscreen, exitFullscreen }
}
