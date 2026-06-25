"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CalendarCheck, DollarSign, TrendingUp, BookOpen, ChevronRight, Clock } from "lucide-react"
import { getInitials, cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import type { ParentDashboardData } from "@/lib/dashboard-data"

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function ParentDashboardClient({ initialData }: { initialData: ParentDashboardData }) {
  const [activeChildId, setActiveChildId] = useState(initialData.activeChildId)
  const [results, setResults] = useState(initialData.results)
  const [attendance, setAttendance] = useState(initialData.attendance)
  const [fees, setFees] = useState(initialData.fees)
  const [events, setEvents] = useState(initialData.events)

  const children = initialData.children
  const gradeBoundaries = initialData.gradeBoundaries
  const activeChild = children.find((c) => c.id === activeChildId) || children[0]

  const getBoundaryColor = (score: number) => {
    for (const b of gradeBoundaries) {
      if (score >= b.min) return b.color
    }
    return "#ef4444"
  }

  const chartData = useMemo(() => {
    return results.filter((r: any) => r.term === "First Term").map((r: any) => ({
      subject: r.subject.substring(0, 4),
      score: r.score,
      fill: getBoundaryColor(r.score),
    }))
  }, [results])

  useEffect(() => {
    if (!activeChildId) return
    Promise.all([
      fetch(`/api/results?studentId=${activeChildId}`).then((r) => r.json()),
      fetch(`/api/attendance-records?studentId=${activeChildId}&summary=true`).then((r) => r.json()),
      fetch(`/api/fees?studentId=${activeChildId}&summary=true`).then((r) => r.json()),
      fetch("/api/events?upcoming=true").then((r) => r.json()).catch(() => []),
    ]).then(([res, att, fee, evts]) => {
      setResults(res)
      setAttendance(att)
      setFees(fee)
      setEvents(Array.isArray(evts) ? evts.slice(0, 5) : [])
    })
  }, [activeChildId])

  if (!activeChild) return null

  return (
    <div className="floating-orbs p-4 md:p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent">
          Parent Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">Monitor your children&apos;s progress</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none"
      >
        {children.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveChildId(c.id)}
            className={cn(
              "flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border",
              activeChildId === c.id
                ? "bg-gradient-to-r from-primary via-purple-500 to-secondary text-white border-transparent shadow-lg shadow-primary/25"
                : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/30 hover:bg-primary/[0.03]"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className={cn(
                "text-[9px]",
                activeChildId === c.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
              )}>
                {getInitials(c.name)}
              </AvatarFallback>
            </Avatar>
            {c.name.split(" ")[0]}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeChild.id}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
        >
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 rounded-2xl">
              <div className="animated-gradient relative p-4 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySC0yNHYtMmg2MHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    >
                      <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg">
                        <AvatarFallback className="bg-white/20 text-white">{getInitials(activeChild.name)}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <p className="font-bold text-lg">{activeChild.name}</p>
                      <p className="text-sm text-white/70">{activeChild.className}</p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {[
                      { label: "Avg Score", value: results.length > 0 ? `${Math.round(results.reduce((s: number, r: any) => s + r.score, 0) / results.length)}%` : "0%" },
                      { label: "Present", value: `${attendance.present || 0}/${attendance.total || 0}` },
                      { label: "Paid ($)", value: `$${fees.paid || 0}` },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="rounded-xl bg-white/10 p-2.5 text-center backdrop-blur-sm transition-all duration-200 hover:bg-white/15"
                      >
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[10px] text-white/70">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {chartData.length > 0 && (
            <motion.div variants={itemVariants} className="mt-5">
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Subject Performance</p>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                    className="h-40 min-h-[160px] min-w-0 origin-bottom"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,27,75,0.95))",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                            color: "#fff",
                            fontSize: 12,
                          }}
                          labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}
                        />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mt-5">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Results", icon: BarChart3, href: "/parent/results", gradient: "from-blue-600 to-blue-500" },
                { label: "Attendance", icon: CalendarCheck, href: "/parent/attendance", gradient: "from-emerald-600 to-emerald-500" },
                { label: "Fees", icon: DollarSign, href: "/parent/fees", gradient: "from-amber-600 to-amber-500" },
                { label: "Timetable", icon: BookOpen, href: "/parent/timetable", gradient: "from-violet-600 to-violet-500" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.label} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative overflow-hidden rounded-xl border border-border/50 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
                    >
                      <Card className="glass-card border-0">
                        <CardContent className="flex items-center gap-2 md:gap-3 p-3 md:p-4">
                          <div className={cn(
                            "flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                            item.gradient,
                          )}>
                            <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium truncate">{item.label}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-muted-foreground/60 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-5">
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Upcoming Events</p>
                </div>
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {events.map((event: any, i: number) => {
                      const d = new Date(event.date + (event.time ? `T${event.time}` : ""))
                      const day = d.getDate()
                      const month = d.toLocaleDateString("en-US", { month: "short" })
                      return (
                        <motion.div
                          key={event.id || i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                          className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5"
                        >
                          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                            <span className="text-[9px] font-bold text-primary">{day}</span>
                            <span className="text-[7px] text-primary/70">{month}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{event.title}</p>
                            {event.time && <p className="text-[10px] text-muted-foreground">{new Date(`2000-01-01T${event.time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} className="group relative">
                <Card className="glass-card border-0 overflow-hidden transition-all duration-200 group-hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.2)]">
                  <CardContent className="p-3 md:p-4">
                    <p className="text-[11px] md:text-xs font-semibold text-muted-foreground mb-2 md:mb-3">Attendance</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] md:text-xs text-muted-foreground mb-1.5">
                          <span>Present</span>
                          <span className="text-emerald-600 font-medium">{attendance.present || 0}</span>
                        </div>
                        <div className="h-1.5 md:h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${attendance.total > 0 ? ((attendance.present || 0) / attendance.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          />
                        </div>
                      </div>
                    </div>
                    {(attendance.late > 0 || attendance.absent > 0) && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-2 md:mt-3 flex gap-2 md:gap-3 text-[10px] text-muted-foreground"
                      >
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
                          Late: {attendance.late}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-red-500" />
                          Absent: {attendance.absent}
                        </span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -2 }} className="group relative">
                <Card className="glass-card border-0 overflow-hidden transition-all duration-200 group-hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.2)]">
                  <CardContent className="p-3 md:p-4">
                    <p className="text-[11px] md:text-xs font-semibold text-muted-foreground mb-2 md:mb-3">Fees</p>
                    <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                      ${fees.paid || 0}
                    </p>
                    <p className="text-[11px] md:text-xs text-muted-foreground">of ${fees.total || 0} total</p>
                    {fees.outstanding > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className="mt-1.5 md:mt-2"
                      >
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300/30 bg-amber-500/5">
                          ${fees.outstanding} outstanding
                        </Badge>
                      </motion.div>
                    )}
                    <div className="mt-2 md:mt-3 h-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${fees.total > 0 ? ((fees.paid || 0) / fees.total) * 100 : 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
