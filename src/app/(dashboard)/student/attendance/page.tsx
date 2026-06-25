"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CalendarCheck, AlertTriangle, Clock } from "lucide-react"
import { useSession } from "next-auth/react"

const COLORS = ["#22c55e", "#ef4444", "#f59e0b"]

export default function StudentAttendancePage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const studRes = await fetch(`/api/students?userId=${userId}`)
      let sid = userId
      if (studRes.ok) {
        const s = await studRes.json()
        if (s?.id) sid = s.id
      }
      const res = await fetch(`/api/attendance-records?studentId=${sid}`)
      const data = await res.json()
      setRecords(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [userId])

  const present = records.filter((r) => r.status === "present").length
  const absent = records.filter((r) => r.status === "absent").length
  const late = records.filter((r) => r.status === "late").length
  const total = records.length
  const rate = total > 0 ? Math.round(present / total * 100) : 0

  const pieData = [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
    { name: "Late", value: late },
  ]

  if (loading) return <div className="p-4 md:p-6"><div className="h-48 md:h-64 min-h-[180px] rounded-xl bg-muted animate-pulse" /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Attendance</h2>
        <p className="text-sm text-muted-foreground">Track your presence record</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Present", value: present, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Absent", value: absent, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Late", value: late, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((s) => (
          <Card key={s.label} className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-0">
          <CardContent className="p-4 md:p-5">
            <h3 className="font-semibold mb-1">Attendance Rate</h3>
            <p className="text-xs text-muted-foreground mb-4">{rate}% overall attendance</p>
            <div className="h-48 min-h-[180px] min-w-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold">{rate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="glass-card border-0">
          <CardContent className="p-4 md:p-5">
            <h3 className="font-semibold mb-3">Recent Records</h3>
            <div className="space-y-2">
              {records.slice(-10).reverse().map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${r.status === "present" ? "bg-green-500/10" : r.status === "absent" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                      {r.status === "present" ? <CalendarCheck className="h-4 w-4 text-green-500" /> : r.status === "absent" ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{r.status}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${r.status === "present" ? "text-green-500" : r.status === "absent" ? "text-red-500" : "text-amber-500"}`}>{r.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
