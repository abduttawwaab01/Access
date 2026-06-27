"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { useParentChildren } from "@/hooks/useParentChildren"

const COLORS = { present: "#10b981", late: "#f59e0b", absent: "#ef4444" }

export default function ParentAttendancePage() {
  const { children, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [records, setRecords] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChildId) return
    setLoading(true)
    fetch(`/api/attendance-records?studentId=${activeChildId}`).then((r) => r.json()).then((recs) => {
      setRecords(recs)
      const present = recs.filter((r: any) => r.status === "present").length
      const absent = recs.filter((r: any) => r.status === "absent").length
      const late = recs.filter((r: any) => r.status === "late").length
      setSummary({ present, absent, late, total: recs.length })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeChildId])

  const pieData = [
    { name: "Present", value: summary.present || 0, color: COLORS.present },
    { name: "Late", value: summary.late || 0, color: COLORS.late },
    { name: "Absent", value: summary.absent || 0, color: COLORS.absent },
  ].filter((d) => d.value > 0)

  const rate = summary.total > 0 ? Math.round(((summary.present || 0) / summary.total) * 100) : 0

  if (childrenLoading) {
    return (
      <div className="p-4 md:p-6 space-y-5">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!activeChildId) return null

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Attendance Records</h2>
        <p className="text-sm text-muted-foreground">Monitor attendance history</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {children.map((c) => (
          <button key={c.id} onClick={() => setActiveChildId(c.id)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] snap-start ${activeChildId === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >{c.name.split(" ")[0]}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4 md:p-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
                <p className={cn("text-5xl font-bold mt-1", rate >= 90 ? "text-success" : rate >= 75 ? "text-warning" : "text-danger")}>
                  {rate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{summary.present || 0} out of {summary.total || 0} days</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Present", value: summary.present || 0, color: "text-success", bg: "bg-success/10" },
              { label: "Late", value: summary.late || 0, color: "text-warning", bg: "bg-warning/10" },
              { label: "Absent", value: summary.absent || 0, color: "text-danger", bg: "bg-danger/10" },
              { label: "Total Days", value: summary.total || 0, color: "text-primary", bg: "bg-primary/10" },
            ].map((stat) => (
              <Card key={stat.label} className="glass-card border-0">
                <CardContent className="p-4 text-center">
                  <p className={cn("text-xl md:text-2xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {pieData.length > 0 && (
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-3">Attendance Breakdown</p>
                <div className="h-48 min-h-[180px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={45} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  {pieData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3">Recent Records</p>
              <div className="space-y-1">
                {records.slice(-10).reverse().map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                    <span className="text-sm">{r.date}</span>
                    <Badge className={cn("capitalize text-[10px]", r.status === "present" ? "bg-success/10 text-success" : r.status === "late" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger")}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
