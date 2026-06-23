"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  CalendarCheck,
  ClipboardCheck,
  DollarSign,
  BookOpen,
  Bell,
  AlertTriangle,
  Clock,
  ChevronRight,
  Plus,
  FileText,
  Settings,
  CreditCard,
  UserPlus,
  Send,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DashboardAnnouncements } from "@/components/DashboardAnnouncements"

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
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

const pendingTasks = [
  { task: "Review 12 admission applications", priority: "high", href: "/admin/admissions", icon: UserPlus },
  { task: "Approve 3 salary disbursements", priority: "medium", href: "/admin/salary", icon: DollarSign },
  { task: "Publish weekly report for Week 12", priority: "medium", href: "/admin/weekly-reports", icon: FileText },
  { task: "Review feedback from 8 parents", priority: "low", href: "/admin/feedback", icon: Bell },
]

const alerts = [
  { message: "5 teachers have not submitted lesson notes this week", type: "warning", href: "/admin/lesson-notes" },
  { message: "18 students have outstanding fee balances", type: "info", href: "/admin/fees" },
  { message: "CBT Exam scheduled for tomorrow - 4 classes", type: "info", href: "/admin/cbt/exams" },
]

const quickActions = [
  { label: "Add Student", icon: UserPlus, href: "/admin/admissions", gradient: "from-blue-600 to-blue-500" },
  { label: "Create Exam", icon: ClipboardCheck, href: "/admin/cbt", gradient: "from-amber-600 to-amber-500" },
  { label: "Take Attendance", icon: CalendarCheck, href: "/admin/attendance", gradient: "from-emerald-600 to-emerald-500" },
  { label: "Send Notice", icon: Send, href: "/admin/announcements", gradient: "from-violet-600 to-violet-500" },
  { label: "Add Teacher", icon: GraduationCap, href: "/admin/teachers", gradient: "from-teal-600 to-teal-500" },
  { label: "Record Payment", icon: CreditCard, href: "/admin/fees", gradient: "from-rose-600 to-rose-500" },
]

const upcomingEvents = [
  { event: "PTA Meeting", date: "Jun 25", time: "10:00 AM" },
  { event: "Mid-Term Break Begins", date: "Jun 28" },
  { event: "Second Term Exams Start", date: "Jul 10" },
]

export default function AdminDashboard() {
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
            Admin Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">What needs your attention today</p>
        </div>
        <Link href="/admin/analytics">
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

      <DashboardAnnouncements role="admin" />

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
                        task.priority === "high" ? "bg-red-500/10 text-red-600" :
                        task.priority === "medium" ? "bg-amber-500/10 text-amber-600" :
                        "bg-blue-500/10 text-blue-600"
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
                          task.priority === "high" ? "border-red-300/30 text-red-600" :
                          task.priority === "medium" ? "border-amber-300/30 text-amber-600" :
                          "border-blue-300/30 text-blue-600"
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

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <Link key={i} href={alert.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    whileHover={{ x: 4 }}
                    className="group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02]"
                  >
                    <div className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      alert.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <p className="text-sm text-muted-foreground flex-1">{alert.message}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions + Upcoming Events */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {upcomingEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-[10px] font-bold text-primary">{event.date.split(" ")[0]}</span>
                      <span className="text-[8px] text-primary/70">{event.date.split(" ")[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.event}</p>
                      {event.time && <p className="text-[11px] text-muted-foreground">{event.time}</p>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
                { label: "Students", icon: Users, href: "/admin/students", color: "text-blue-600" },
                { label: "Teachers", icon: GraduationCap, href: "/admin/teachers", color: "text-emerald-600" },
                { label: "Results", icon: ClipboardCheck, href: "/admin/results", color: "text-violet-600" },
                { label: "Settings", icon: Settings, href: "/admin/settings", color: "text-amber-600" },
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
