"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { usePWAInstall } from "@/hooks/usePWAInstall"

export function PWAInstallBanner() {
  const { isInstallable, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-lg backdrop-blur-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Download className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium">Install App</span>
          <Button size="sm" className="h-7 px-3 text-xs bg-primary text-white hover:bg-primary/90" onClick={install}>
            Install
          </Button>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground ml-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
