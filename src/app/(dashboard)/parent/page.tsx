"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CalendarCheck, DollarSign, Bell, TrendingUp, BookOpen, ChevronRight } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"

const childrenData = [
  { id: "1", name: "Alice Johnson", class: "Grade 10A", className: "Grade 10", arm: "A", image: undefined },
  { id: "2", name: "Bob Johnson", class: "Grade 8B", className: "Grade 8", arm: "B", image: undefined },
]

export default function ParentDashboard() {
  const [activeChild, setActiveChild] = useState("1")
  const [results, setResults] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>({})
  const [fees, setFees] = useState<any>({})

  const child = childrenData.find((c) => c.id === activeChild) || childrenData[0]

  useEffect(() => {
    Promise.all([
      fetch(`/api/results?studentId=${activeChild}`).then((r) => r.json()),
      fetch(`/api/attendance-records?studentId=${activeChild}&summary=true`).then((r) => r.json()),
      fetch(`/api/fees?studentId=${activeChild}&summary=true`).then((r) => r.json()),
    ]).then(([res, att, fee]) => {
      setResults(res)
      setAttendance(att)
      setFees(fee)
    })
  }, [activeChild])

  const chartData = results.filter((r: any) => r.term === "First Term").map((r: any) => ({
    subject: r.subject.substring(0, 4),
    score: r.score,
    fill: r.score >= 80 ? "#10b981" : r.score >= 60 ? "#f59e0b" : "#ef4444",
  }))

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Child Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {childrenData.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveChild(c.id)}
            className={`flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeChild === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[9px] bg-white/20">{getInitials(c.name)}</AvatarFallback>
            </Avatar>
            {c.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Hero Card */}
      <motion.div key={child.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-0">
          <div className="animated-gradient p-4 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white">{getInitials(child.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{child.name}</p>
                <p className="text-sm text-white/70">{child.class}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-bold">{results.length > 0 ? Math.round(results.reduce((s: number, r: any) => s + r.score, 0) / results.length) : 0}%</p>
                <p className="text-[10px] text-white/70">Avg Score</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-bold">{attendance.present || 0}/{attendance.total || 0}</p>
                <p className="text-[10px] text-white/70">Present</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-bold">{fees.paid || 0}</p>
                <p className="text-[10px] text-white/70">Paid ($)</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Subject Performance</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Results", icon: BarChart3, href: "/parent/results", color: "text-primary" },
          { label: "Attendance", icon: CalendarCheck, href: "/parent/attendance", color: "text-success" },
          { label: "Fees", icon: DollarSign, href: "/parent/fees", color: "text-warning" },
          { label: "Timetable", icon: BookOpen, href: "/parent/timetable", color: "text-info" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.label} href={item.href}>
              <Card className="glass-card border-0 cursor-pointer hover:border-primary/30 transition-all group">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Attendance & Fees Snapshot */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Attendance</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Present</span>
                  <span className="text-success">{attendance.present || 0}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: `${attendance.total > 0 ? ((attendance.present || 0) / attendance.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            {(attendance.late > 0 || attendance.absent > 0) && (
              <div className="mt-2 flex gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Late: {attendance.late}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> Absent: {attendance.absent}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Fees</p>
            <p className="text-2xl font-bold text-success">${fees.paid || 0}</p>
            <p className="text-xs text-muted-foreground">of ${fees.total || 0} total</p>
            {fees.outstanding > 0 && (
              <Badge variant="outline" className="mt-2 text-[10px] text-warning border-warning/30">
                ${fees.outstanding} outstanding
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
