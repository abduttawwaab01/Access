"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen, Users, FileText, ClipboardCheck, Clock, ChevronRight,
  AlertTriangle, Bell, CalendarCheck, Plus, ArrowRight,
  GraduationCap, Send, Eye, CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function TeacherDashboard() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacher, setTeacher] = useState<any>(null)
  const [stats, setStats] = useState<any>({})
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        setTeacher(staffData)
        const staffId = staffData?.id || ""
        return fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json())
      })
      .then((tas) => {
        const ta = Array.isArray(tas) ? tas[0] : null
        const classIds: string[] = ta?.classIds || []
        return Promise.all([
          fetch("/api/classes").then((r) => r.json()),
          fetch("/api/lesson-notes").then((r) => r.json()),
          fetch("/api/assignments").then((r) => r.json()),
          fetch("/api/timetable").then((r) => r.json()),
          fetch("/api/events?upcoming=true").then((r) => r.json()).catch(() => []),
          fetch("/api/attendance-logs").then((r) => r.json()).catch(() => []),
          classIds,
        ])
      })
      .then(([classes, notes, asgns, tt, evts, logs, classIds]) => {
        const filteredNotes = classIds.length > 0 ? notes.filter((n: any) => classIds.includes(n.classId)) : notes
        const filteredAsgns = classIds.length > 0 ? asgns.filter((a: any) => classIds.includes(a.classId)) : asgns
        const filteredTT = classIds.length > 0 ? tt.filter((t: any) => classIds.includes(t.classId)) : tt
        setStats({
          classes: classIds.length || classes.length,
          students: classes.reduce((s: number, c: any) => s + (c.studentCount || 0), 0),
          lessons: filteredNotes.length,
          assignments: filteredAsgns.length,
        })
        setLessons(filteredNotes.filter((n: any) => n.status === "draft").slice(0, 3))
        setAssignments(filteredAsgns.filter((a: any) => a.status === "active"))
        setSchedule(filteredTT.filter((t: any) => t.day === today))
        setEvents(Array.isArray(evts) ? evts.slice(0, 5) : [])
        const logsArr = Array.isArray(logs) ? logs : []
        setAttendanceMarked(logsArr.some((l: any) => {
          const logDate = new Date(l.date || l.createdAt)
          const now = new Date()
          return logDate.toDateString() === now.toDateString()
        }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const pendingTasks = [
    { task: `${lessons.length} lesson note${lessons.length !== 1 ? "s" : ""} need${lessons.length === 1 ? "s" : ""} publishing`, priority: "medium" as const, href: "/teacher/lesson-notes", icon: FileText },
    { task: `${assignments.filter((a: any) => a.submissions < a.total).length} assignment${assignments.filter((a: any) => a.submissions < a.total).length !== 1 ? "s" : ""} need grading`, priority: "high" as const, href: "/teacher/assignments", icon: ClipboardCheck },
    ...(!attendanceMarked ? [{ task: "Mark today's attendance", priority: "high" as const, href: "/teacher/attendance", icon: CalendarCheck }] : []),
  ]

  const quickActions = [
    { label: "New Lesson Note", icon: FileText, href: "/teacher/lesson-notes", gradient: "from-blue-600 to-blue-500" },
    { label: "Create Assignment", icon: ClipboardCheck, href: "/teacher/assignments", gradient: "from-amber-600 to-amber-500" },
    { label: "Mark Attendance", icon: CalendarCheck, href: "/teacher/attendance", gradient: "from-emerald-600 to-emerald-500" },
    { label: "View Classes", icon: BookOpen, href: "/teacher/classes", gradient: "from-violet-600 to-violet-500" },
    { label: "Take CBT Exam", icon: GraduationCap, href: "/teacher/cbt", gradient: "from-teal-600 to-teal-500" },
    { label: "Send Message", icon: Send, href: "/teacher/communication", gradient: "from-rose-600 to-rose-500" },
  ]

  if (loading) {
    return (
      <div className="floating-orbs p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
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
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-2xl font-bold text-transparent">
            Teacher Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">What needs your attention today</p>
        </div>
        <Link href="/teacher/analytics">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-purple-500 to-secondary px-4 py-2 text-xs font-medium text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            View Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Pending Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Pending Tasks
            </CardTitle>
            <Badge variant="outline" className="text-[10px] border-amber-300/30 bg-amber-500/10 text-amber-600">
              {pendingTasks.length} pending
            </Badge>
          </CardHeader>
          <CardContent>
            <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
              {pendingTasks.map((task, i) => {
                const Icon = task.icon
                return (
                  <Link key={i} href={task.href}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      className="group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110",
                        task.priority === "high" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.task}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] shrink-0",
                          task.priority === "high" ? "border-red-300/30 text-red-600" : "border-amber-300/30 text-amber-600"
                        )}
                      >
                        {task.priority}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary shrink-0" />
                    </motion.div>
                  </Link>
                )
              })}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Schedule + Active Assignments */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden h-full">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Today&apos;s Schedule
              </CardTitle>
              <Link href="/teacher/timetable" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No classes scheduled today</p>
              ) : (
                <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
                  {schedule.map((item: any, i: number) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      className="group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-[10px] font-bold text-primary">{item.time?.split(":")[0]}</span>
                        <span className="text-[8px] text-primary/70">{item.time?.split(":")[1]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.subject}</p>
                        <p className="text-[11px] text-muted-foreground truncate">Room {item.room}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary shrink-0" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden h-full">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Active Assignments
              </CardTitle>
              <Link href="/teacher/assignments" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No active assignments</p>
              ) : (
                <div className="space-y-2">
                  {assignments.slice(0, 4).map((item: any, i: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      whileHover={{ x: 4, y: -1 }}
                      className="group flex items-center justify-between rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.subject} · Due {item.dueDate}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 ml-2 border-primary/20 bg-primary/[0.03]">
                        {item.submissions}/{item.total}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-border/50 p-3 transition-all duration-300 hover:border-primary/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className={cn(
                        "relative rounded-xl bg-gradient-to-br p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                        action.gradient,
                        "shadow-md"
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="relative text-[10px] font-medium text-center leading-tight">{action.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">No upcoming events</p>
            ) : (
              <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
                {events.map((event, i) => {
                  const d = new Date(event.date + (event.time ? `T${event.time}` : ""))
                  const day = d.getDate()
                  const month = d.toLocaleDateString("en-US", { month: "short" })
                  return (
                    <motion.div key={event.id || i} variants={itemVariants} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-[10px] font-bold text-primary">{day}</span>
                        <span className="text-[8px] text-primary/70">{month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        {event.time && <p className="text-[11px] text-muted-foreground">{new Date(`2000-01-01T${event.time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Shortcuts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "My Classes", icon: BookOpen, href: "/teacher/classes", color: "text-blue-600" },
                { label: "Lesson Notes", icon: FileText, href: "/teacher/lesson-notes", color: "text-emerald-600" },
                { label: "Attendance", icon: CalendarCheck, href: "/teacher/attendance", color: "text-violet-600" },
                { label: "Notifications", icon: Bell, href: "/teacher/notifications", color: "text-amber-600" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.label} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex items-center gap-2 rounded-xl border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02]"
                    >
                      <Icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110", item.color)} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
