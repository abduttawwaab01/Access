"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Bell, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Announcement {
  id: string
  title: string
  content: string
  audience?: string
  targetAudience?: string
  priority?: string
  endDate?: string | null
  active?: boolean
  createdAt?: string
}

const roleToAudience: Record<string, string> = {
  admin: "admin",
  teacher: "teachers",
  student: "students",
  parent: "parents",
}

const priorityConfig: Record<string, { icon: any; color: string }> = {
  high: { icon: AlertTriangle, color: "text-danger bg-danger/10 border-danger/20" },
  normal: { icon: Bell, color: "text-primary bg-primary/10 border-primary/20" },
  low: { icon: Info, color: "text-muted-foreground bg-muted border-border/50" },
}

function isExpired(item: Announcement): boolean {
  if (!item.endDate) return false
  return new Date(item.endDate) < new Date()
}

function matchesAudience(item: Announcement, role: string): boolean {
  const audience = roleToAudience[role] || "all"
  const target = item.targetAudience || item.audience || "all"
  if (target === "all") return true
  if (role === "admin" && target === "admin") return true
  return target === audience
}

export function DashboardAnnouncements({ role }: { role: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const audience = roleToAudience[role] || "all"
    Promise.all([
      fetch(`/api/announcements?audience=${audience}`).then((r) => r.json()).catch(() => []),
      fetch("/api/superadmin?action=announcements").then((r) => r.json()).catch(() => []),
    ]).then(([adminData, superData]: [any, any]) => {
      const adminItems: Announcement[] = Array.isArray(adminData) ? adminData : []
      const superItems: Announcement[] = Array.isArray(superData) ? superData : []
      const all = [...adminItems, ...superItems]
      const valid = all.filter((a) => a.active !== false && !isExpired(a) && matchesAudience(a, role))
      setAnnouncements(valid)
    })
  }, [role])

  if (announcements.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5 }}
    >
      <Card className="glass-card border-0 overflow-hidden">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Announcements
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary">
            {announcements.length} active
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {announcements.map((item, i) => {
              const cfg = priorityConfig[item.priority || "normal"] || priorityConfig.normal
              const Icon = cfg.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="group flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02]"
                >
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", cfg.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{item.title}</span>
                      {item.priority === "high" && (
                        <Badge variant="outline" className="text-[9px] border-danger/30 text-danger">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.content}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
