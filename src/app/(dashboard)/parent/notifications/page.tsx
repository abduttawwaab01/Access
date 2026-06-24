"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ParentNotificationsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/announcements").then((r) => r.json()).then((data) => {
      setItems(data.filter((a: any) => a.audience === "all" || a.audience === "parents"))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const priorityIcon: Record<string, any> = { high: AlertTriangle, normal: Bell, low: Info }
  const priorityColor: Record<string, string> = {
    high: "text-danger bg-danger/10 border-danger/20",
    normal: "text-primary bg-primary/10 border-primary/20",
    low: "text-muted-foreground bg-muted border-border/50",
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground">School announcements and updates</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <Card className="glass-card border-0"><CardContent className="p-8 text-center text-muted-foreground">No notifications yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const Icon = priorityIcon[item.priority] || Bell
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={cn("flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl", priorityColor[item.priority])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold truncate">{item.title}</p>
                          <Badge variant="outline" className={cn("shrink-0 text-[10px]", item.priority === "high" ? "border-danger/30 text-danger" : "")}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.author} · {new Date(item.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
