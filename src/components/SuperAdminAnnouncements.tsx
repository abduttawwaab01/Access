"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Megaphone, AlertTriangle } from "lucide-react"
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            <div className="relative p-5 md:p-6">
              <div className="mb-4 flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Megaphone className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">Portal Announcement</p>
                </div>
                <button
                  onClick={() => setDismissed((p) => new Set(p).add(a.id))}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{a.content}</p>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                <span>This announcement requires your attention</span>
              </div>
            </div>
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
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="relative overflow-hidden border-b border-border/40 bg-gradient-to-r from-primary/[0.04] via-background to-primary/[0.04]"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 md:px-6">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Megaphone className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">{a.title}</span>
              <span className="hidden sm:inline text-muted-foreground/30">|</span>
              <span className="text-xs text-muted-foreground/80">{a.content}</span>
            </div>
            <button
              onClick={() => setDismissed((p) => new Set(p).add(a.id))}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/30 transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
