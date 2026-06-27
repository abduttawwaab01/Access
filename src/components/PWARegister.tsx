"use client"

import { usePWAInstall } from "@/hooks/usePWAInstall"
import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
    }
  }, [])

  return null
}
