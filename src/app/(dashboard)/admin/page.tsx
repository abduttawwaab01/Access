"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, CalendarCheck, ClipboardCheck, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

const gradientPairs: Record<string, string> = {
  "Total Students": "from-blue-600 via-blue-500 to-cyan-400",
  "Total Teachers": "from-emerald-600 via-emerald-500 to-teal-400",
  "Attendance Today": "from-violet-600 via-violet-500 to-purple-400",
  "Active Exams": "from-amber-600 via-amber-500 to-orange-400",
  "Avg Performance": "from-rose-600 via-rose-500 to-pink-400",
  "Revenue": "from-green-600 via-green-500 to-lime-400",
}

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

const stats = [
  { label: "Total Students", value: "1,284", change: "+12", icon: Users, trend: "up" as const },
  { label: "Total Teachers", value: "86", change: "+3", icon: GraduationCap, trend: "up" as const },
  { label: "Attendance Today", value: "94%", change: "+2%", icon: CalendarCheck, trend: "up" as const },
  { label: "Active Exams", value: "4", change: "-1", icon: ClipboardCheck, trend: "down" as const },
  { label: "Avg Performance", value: "78%", change: "+5%", icon: TrendingUp, trend: "up" as const },
  { label: "Revenue", value: "$45,200", change: "+8%", icon: DollarSign, trend: "up" as const },
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
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening at your school</p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          const gradient = gradientPairs[stat.label] || "from-primary via-purple-500 to-secondary"
          return (
            <motion.div key={stat.label} variants={cardVariants} whileHover={{ scale: 1.03, rotate: 0.5 }} className="group relative">
              <Card className="glass-card relative overflow-hidden border-0 transition-shadow duration-300 group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]">
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <CardContent className="p-3 md:p-4">
                  <div className="mb-2 md:mb-3 flex items-center justify-between">
                    <div className={cn("flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br", gradient, "shadow-lg shadow-primary/20")}>
                      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                    </div>
                    <motion.span
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      )}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </motion.span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="relative space-y-3"
              >
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-secondary opacity-30" />
                  {[
                    { action: "New student enrolled", detail: "John Doe - Grade 10A", time: "2 min ago" },
                    { action: "Exam completed", detail: "Mathematics Mid-Term - 85% pass rate", time: "1 hour ago" },
                    { action: "Attendance marked", detail: "Grade 12 - 96% present today", time: "3 hours ago" },
                    { action: "Fee payment received", detail: "Sarah Smith - $500 tuition", time: "5 hours ago" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      className="group relative flex items-start gap-2 md:gap-3 rounded-lg border border-border/50 p-2.5 md:p-3 transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 300 }}
                        className="relative mt-1 h-3 w-3 shrink-0"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-500 opacity-30 blur-sm" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">{item.action}</p>
                        <p className="text-[11px] md:text-xs text-muted-foreground truncate">{item.detail}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                    </motion.div>
                  ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="glass-card border-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Add Student", icon: Users },
                  { label: "Create Exam", icon: ClipboardCheck },
                  { label: "Take Attendance", icon: CalendarCheck },
                  { label: "Send Notice", icon: GraduationCap },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative flex flex-col items-center gap-1.5 md:gap-2 overflow-hidden rounded-xl border border-border/50 p-3 md:p-4 transition-all duration-300 hover:border-primary/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className={cn(
                        "relative rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-2 md:p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20",
                      )}>
                        <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary transition-transform duration-300 group-hover:rotate-3" />
                      </div>
                      <span className="relative text-[11px] md:text-xs font-medium text-center leading-tight">{action.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
