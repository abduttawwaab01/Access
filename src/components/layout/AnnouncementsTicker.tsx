"use client"

import { useState, useEffect, useRef } from "react"

interface Announcement {
  id: string
  title: string
  content: string
  active?: boolean
  audience?: string
  targetAudience?: string
}

const roleToAudience: Record<string, string> = { admin: "admin", teacher: "teachers", student: "students", parent: "parents" }

export function AnnouncementsTicker({ role }: { role?: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audience = roleToAudience[role || ""] || "all"
    Promise.all([
      fetch(`/api/announcements?audience=${audience}`).then((r) => r.json()).catch(() => []),
      fetch("/api/superadmin?action=announcements").then((r) => r.json()).catch(() => []),
    ]).then(([adminData, superData]: [any, any]) => {
      const adminItems: Announcement[] = Array.isArray(adminData) ? adminData : []
      const superItems: Announcement[] = Array.isArray(superData) ? superData : []
      const filteredSuper = superItems.filter((a) => {
        if (a.targetAudience === "all") return true
        if (role === "admin" && a.targetAudience === "admin") return true
        return a.targetAudience === audience
      })
      setAnnouncements([...adminItems, ...filteredSuper])
    })
  }, [role])

  useEffect(() => {
    if (announcements.length < 2) return
    const interval = setInterval(() => {
      if (!paused) setCurrent((c) => (c + 1) % announcements.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [announcements.length, paused])

  if (announcements.length === 0) return null

  const item = announcements[current]

  return (
    <div
      ref={containerRef}
      className="relative flex items-center overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/10 h-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-2 shrink-0 px-3 h-full bg-primary/10 border-r border-primary/10">
        <span className="text-xs font-bold text-primary tracking-wide uppercase">News</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-full">
        <div className="absolute inset-0 flex items-center">
          <div
            key={current}
            className="whitespace-nowrap text-xs font-medium text-foreground/80 animate-scroll"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            <span className="px-4">{item.title}{item.content ? ` — ${item.content}` : ""}</span>
            <span className="px-4 mx-8 text-primary/40">✦</span>
            <span className="px-4">{item.title}{item.content ? ` — ${item.content}` : ""}</span>
            <span className="px-4 mx-8 text-primary/40">✦</span>
            <span className="px-4">{item.title}{item.content ? ` — ${item.content}` : ""}</span>
            <span className="px-4 mx-8 text-primary/40">✦</span>
            <span className="px-4">{item.title}{item.content ? ` — ${item.content}` : ""}</span>
          </div>
        </div>
      </div>
      {announcements.length > 1 && (
        <div className="flex items-center gap-1 shrink-0 px-3 h-full bg-primary/5 border-l border-primary/10">
          <span className="text-[10px] text-muted-foreground font-mono">
            {current + 1}/{announcements.length}
          </span>
        </div>
      )}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
