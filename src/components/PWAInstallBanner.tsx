"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { usePWAInstall } from "@/hooks/usePWAInstall"

export function PWAInstallBanner() {
  const { isInstallable, install } = usePWAInstall()

  if (!isInstallable) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80"
      >
        <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Install Access</p>
                <p className="text-xs opacity-80">Get the best experience</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-white text-primary hover:bg-white/90" onClick={install}>
              <Download className="h-4 w-4 mr-1" /> Install
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
