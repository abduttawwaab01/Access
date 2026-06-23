"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, Info } from "lucide-react"
import { useSession } from "next-auth/react"

const DISMISSED_KEY = "super-announcement-dismissed"

const roleToAudience: Record<string, string> = {
  admin: "admin", teacher: "teachers", student: "students", parent: "parents",
}

function loadDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveDismissed(ids: Set<string>) {
  try { sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids])) } catch {}
}

function matchesAudience(item: any, role: string | undefined): boolean {
  if (!role) return true
  const target = item.targetAudience || item.audience || "all"
  if (target === "all") return true
  const audience = roleToAudience[role] || "all"
  if (role === "admin" && target === "admin") return true
  return target === audience
}

export function SuperAdminAnnouncements() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as string | undefined
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed)

  useEffect(() => {
    fetch("/api/superadmin?action=announcements")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data.filter((a: any) => a.active))
        else if (data.announcements) setAnnouncements(data.announcements.filter((a: any) => a.active))
      })
      .catch(() => {})
  }, [])

  useEffect(() => { saveDismissed(dismissed) }, [dismissed])

  const visible = announcements.filter((a) => !dismissed.has(a.id) && matchesAudience(a, role))

  if (visible.length === 0) return null

  return (
    <AnimatePresence>
      {/* Overlay */}
      {visible.filter((a) => a.displayType === "overlay").map((a) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600/20 to-red-800/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white">{a.title}</h3>
                <p className="text-xs text-zinc-500">Portal Announcement</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-zinc-300">{a.content}</p>
            <button
              onClick={() => setDismissed((p) => new Set(p).add(a.id))}
              className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      ))}

      {/* Banner */}
      {visible.filter((a) => a.displayType === "banner" || (!a.displayType)).map((a) => (
        <motion.div
          key={a.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5"
        >
          <div className="flex items-start gap-3 px-4 py-3 md:px-6 md:py-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
              <Info className="h-3 w-3 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-100">{a.title}</p>
              <p className="mt-0.5 text-xs text-amber-200/70">{a.content}</p>
            </div>
            <button
              onClick={() => setDismissed((p) => new Set(p).add(a.id))}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-amber-300/50 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
