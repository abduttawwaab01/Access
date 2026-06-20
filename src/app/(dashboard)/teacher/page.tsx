"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, FileText, ClipboardCheck, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const gradientMap: Record<string, string> = {
  "My Classes": "from-blue-600 via-blue-500 to-cyan-400",
  "Students": "from-emerald-600 via-emerald-500 to-teal-400",
  "Lesson Notes": "from-violet-600 via-violet-500 to-purple-400",
  "Assignments": "from-amber-600 via-amber-500 to-orange-400",
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>({})
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/lesson-notes").then((r) => r.json()),
      fetch("/api/assignments").then((r) => r.json()),
      fetch("/api/timetable").then((r) => r.json()),
    ]).then(([classes, notes, asgns, tt]) => {
      const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]
      setStats({ classes: classes.length, students: classes.reduce((s: number, c: any) => s + (c.studentCount || 0), 0), lessons: notes.length, assignments: asgns.length })
      setLessons(notes.slice(0, 3))
      setAssignments(asgns.filter((a: any) => a.status === "active"))
      setSchedule(tt.filter((t: any) => t.day === today))
      setLoading(false)
    })
  }, [])

  const statCards = [
    { label: "My Classes", value: stats.classes || 0, icon: BookOpen, color: "text-primary", href: "/teacher/classes" },
    { label: "Students", value: stats.students || 0, icon: Users, color: "text-success", href: "/teacher/classes" },
    { label: "Lesson Notes", value: stats.lessons || 0, icon: FileText, color: "text-info", href: "/teacher/lesson-notes" },
    { label: "Assignments", value: stats.assignments || 0, icon: ClipboardCheck, color: "text-warning", href: "/teacher/assignments" },
  ]

  if (loading) {
    return (
      <div className="floating-orbs p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-52 animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-52 animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div className="floating-orbs p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent">
          Teacher Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s your overview</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon
          const gradient = gradientMap[stat.label] || "from-primary via-purple-500 to-secondary"
          return (
            <motion.div key={stat.label} variants={cardVariants} whileHover={{ scale: 1.03, y: -3 }} className="group relative">
              <Link href={stat.href}>
                <Card className="glass-card relative overflow-hidden border-0 transition-all duration-300 group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.25)]">
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <CardContent className="p-4">
                    <div className={cn(
                      "mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-primary/20",
                      gradient,
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Today&apos;s Schedule
              </CardTitle>
              <Link href="/teacher/timetable" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground py-4 text-center"
                >
                  No classes scheduled today
                </motion.p>
              ) : (
                <div className="space-y-2 relative">
                  <div className="absolute left-[23px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-secondary opacity-20" />
                  {schedule.map((item: any, i: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      className="group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.06, type: "spring", stiffness: 300 }}
                        className="relative h-3 w-3 shrink-0"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-500 opacity-30 blur-sm" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                      </motion.div>
                      <div className="text-xs font-medium text-muted-foreground w-12 shrink-0">{item.time}</div>
                      <div className="h-8 w-0.5 rounded-full bg-gradient-to-b from-primary/40 to-purple-500/40" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">Room {item.room}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Active Assignments
              </CardTitle>
              <Link href="/teacher/assignments" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground py-4 text-center"
                >
                  No active assignments
                </motion.p>
              ) : (
                <div className="space-y-2">
                  {assignments.slice(0, 4).map((item: any, i: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
                      whileHover={{ x: 4, y: -1, transition: { duration: 0.2 } }}
                      className="group flex items-center justify-between rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.subject} · Due {item.dueDate}</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge variant="outline" className="text-[10px] shrink-0 ml-2 border-primary/20 bg-primary/[0.03]">
                          {item.submissions}/{item.total}
                        </Badge>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Recent Lesson Notes
            </CardTitle>
            <Link href="/teacher/lesson-notes" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground py-4 text-center"
              >
                No lesson notes yet
              </motion.p>
            ) : (
              <div className="space-y-2">
                {lessons.map((item: any, i: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
                    whileHover={{ x: 4, y: -1, transition: { duration: 0.2 } }}
                    className="group flex items-center justify-between rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subject} · Week {item.week} · {item.createdAt}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge className={cn(
                        "shrink-0 ml-2 border-0",
                        item.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      )}>
                        {item.status}
                      </Badge>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
