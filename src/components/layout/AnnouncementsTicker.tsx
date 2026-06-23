"use client"

import { useState, useEffect, useRef } from "react"
import { Megaphone, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Announcement {
  id: string
  title: string
  content: string
  active?: boolean
  audience?: string
  targetAudience?: string
  priority?: string
  endDate?: string | null
  createdAt?: string
}

const roleToAudience: Record<string, string> = {
  admin: "admin", teacher: "teachers", student: "students", parent: "parents",
}

function isExpired(item: Announcement): boolean {
  if (!item.endDate) return false
  return new Date(item.endDate) < new Date()
}

function matchesAudience(item: Announcement, role: string): boolean {
  const target = item.targetAudience || item.audience || "all"
  if (target === "all") return true
  const audience = roleToAudience[role] || "all"
  if (role === "admin" && target === "admin") return true
  return target === audience
}

export function AnnouncementsTicker({ role }: { role?: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [paused, setPaused] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    const audience = roleToAudience[role || ""] || "all"
    Promise.all([
      fetch(`/api/announcements?audience=${audience}`).then((r) => r.json()).catch(() => []),
      fetch("/api/superadmin?action=announcements").then((r) => r.json()).catch(() => []),
    ]).then(([adminData, superData]: [any, any]) => {
      const adminItems: Announcement[] = Array.isArray(adminData) ? adminData : []
      const superItems: Announcement[] = Array.isArray(superData) ? superData : []
      const all = [...adminItems, ...superItems]
      const valid = all.filter((a) => a.active !== false && !isExpired(a) && matchesAudience(a, role || ""))
      setAnnouncements(valid)
      loadedRef.current = true
    })
  }, [role])

  if (announcements.length === 0) return null

  const tickerText = announcements
    .map((a) => `${a.title}${a.content ? ` — ${a.content}` : ""}`)
    .join("  ✦  ")

  return (
    <div
      className="relative flex items-center overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-border/40 h-9 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-1.5 shrink-0 px-3 h-full bg-primary/10 border-r border-primary/10">
        <Megaphone className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-bold text-primary tracking-wider uppercase">News</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-full">
        <div className="absolute inset-0 flex items-center">
          <div
            className="whitespace-nowrap text-xs text-foreground/80 font-medium marquee-content"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            <span>{tickerText}</span>
            <span className="mx-4">&nbsp;✦&nbsp;</span>
            <span>{tickerText}</span>
          </div>
        </div>
      </div>
      {role === "admin" && (
        <div className="flex items-center shrink-0 h-full border-l border-border/40">
          <Link
            href="/admin/announcements"
            className="flex items-center justify-center w-8 h-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Manage announcements"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          animation: marquee-scroll 35s linear infinite;
        }
      `}</style>
    </div>
  )
}
