"use client"

import { useEffect, useState } from "react"
import { X, Megaphone, AlertTriangle, Info } from "lucide-react"

const DISMISSED_KEY = "super-announcement-dismissed"

function loadDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveDismissed(ids: Set<string>) {
  try { sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids])) } catch {}
}

export function SuperAdminAnnouncements() {
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

  const visible = announcements.filter((a) => !dismissed.has(a.id))

  if (visible.length === 0) return null

  return (
    <>
      {/* Ticker */}
      {visible.filter((a) => a.displayType === "ticker").map((a) => (
        <div key={a.id} className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10 border-b border-border/40">
          <div className="animate-marquee whitespace-nowrap py-2 text-sm font-medium">
            <span className="mx-4 inline-flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              {a.title}: {a.content}
            </span>
          </div>
          <button onClick={() => setDismissed((p) => new Set(p).add(a.id))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {/* Overlay */}
      {visible.filter((a) => a.displayType === "overlay").map((a) => (
        <div key={a.id} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card mx-4 max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="animated-gradient flex h-10 w-10 items-center justify-center rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">{a.title}</h3>
                <p className="text-xs text-muted-foreground">Portal Announcement</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">{a.content}</p>
            <button onClick={() => setDismissed((p) => new Set(p).add(a.id))} className="animated-gradient w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-lg">
              Got it
            </button>
          </div>
        </div>
      ))}

      {/* Banner */}
      {visible.filter((a) => a.displayType === "banner" || (!a.displayType)).map((a) => (
        <div key={a.id} className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-b border-border/40 px-6 py-3">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.content}</p>
            </div>
            <button onClick={() => setDismissed((p) => new Set(p).add(a.id))} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  )
}
