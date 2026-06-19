"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, FileText, ClipboardCheck, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>({})
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])

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
    })
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s your overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "My Classes", value: stats.classes || 0, icon: BookOpen, color: "text-primary", href: "/teacher/classes" },
          { label: "Students", value: stats.students || 0, icon: Users, color: "text-success", href: "/teacher/classes" },
          { label: "Lesson Notes", value: stats.lessons || 0, icon: FileText, color: "text-info", href: "/teacher/lesson-notes" },
          { label: "Assignments", value: stats.assignments || 0, icon: ClipboardCheck, color: "text-warning", href: "/teacher/assignments" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={stat.href}>
                <Card className="glass-card border-0 cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="mb-3 rounded-lg bg-primary/10 p-2 w-fit">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-0">
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
              <div className="space-y-2">
                {schedule.map((item: any, i: number) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                  >
                    <div className="text-xs font-medium text-muted-foreground w-12">{item.time}</div>
                    <div className="h-8 w-1 rounded-full bg-primary/30" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">Room {item.room}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
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
                  <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subject} · Due {item.dueDate}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {item.submissions}/{item.total}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Recent Lesson Notes
          </CardTitle>
          <Link href="/teacher/lesson-notes" className="text-xs text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No lesson notes yet</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((item: any, i: number) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subject} · Week {item.week} · {item.createdAt}</p>
                  </div>
                  <Badge className={item.status === "published" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                    {item.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
