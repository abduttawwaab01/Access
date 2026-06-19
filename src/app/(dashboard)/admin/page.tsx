"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, CalendarCheck, ClipboardCheck, TrendingUp, DollarSign } from "lucide-react"

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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening at your school</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className={`text-xs font-medium ${stat.trend === "up" ? "text-success" : "text-danger"}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "New student enrolled", detail: "John Doe - Grade 10A", time: "2 min ago" },
                { action: "Exam completed", detail: "Mathematics Mid-Term - 85% pass rate", time: "1 hour ago" },
                { action: "Attendance marked", detail: "Grade 12 - 96% present today", time: "3 hours ago" },
                { action: "Fee payment received", detail: "Sarah Smith - $500 tuition", time: "5 hours ago" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
                >
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary/50" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
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
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
