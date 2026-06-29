"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParentChildren } from "@/hooks/useParentChildren"
import { ClipboardCheck, CalendarDays, BookOpen, Users, CheckCircle2, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ParentAssignmentsPage() {
  const { children, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeChildId || childrenLoading) return
    setLoading(true)
    Promise.all([
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/assignments").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch(`/api/submissions?studentId=${activeChildId}`).then((r) => r.json()),
    ]).then(([allStudents, asgnsData, clsData, subsData]) => {
      const student = (Array.isArray(allStudents) ? allStudents : []).find((s: any) => s.id === activeChildId)
      if (!student?.classId) { setLoading(false); return }
      const classAssignments = (Array.isArray(asgnsData) ? asgnsData : []).filter((a: any) => a.classId === student.classId)
      setAssignments(classAssignments)
      setClasses(Array.isArray(clsData) ? clsData : [])
      setSubmissions(Array.isArray(subsData) ? subsData : (subsData.data || []))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeChildId, childrenLoading])

  const getClassName = (id: string) => classes.find((c) => c.name === id || c.id === id)

  const getSubmissionFor = (assignmentId: string) => submissions.find((s) => s.assignmentId === assignmentId)

  const now = new Date()
  const activeItems = assignments.filter((a) => {
    const due = a.dueDate ? new Date(a.dueDate) : null
    return a.status !== "closed" && (!due || due >= now)
  })
  const overdueItems = assignments.filter((a) => {
    const due = a.dueDate ? new Date(a.dueDate) : null
    return a.status !== "closed" && due && due < now
  })
  const closedItems = assignments.filter((a) => a.status === "closed")

  const filtered = tab === "all" ? assignments : tab === "active" ? activeItems : tab === "overdue" ? overdueItems : closedItems

  const formatDate = (d: string | Date) => {
    if (!d) return ""
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Assignments</h2>
        <p className="text-sm text-muted-foreground">Track your child's assignments and submissions</p>
      </motion.div>

      {children.length > 1 && (
        <Select value={activeChildId} onValueChange={(v) => v && setActiveChildId(v)}>
          <SelectTrigger className="w-full sm:w-64 h-12">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} — {c.className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="all" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">All ({assignments.length})</TabsTrigger>
          <TabsTrigger value="active" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Active ({activeItems.length})</TabsTrigger>
          <TabsTrigger value="overdue" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Overdue ({overdueItems.length})</TabsTrigger>
          <TabsTrigger value="closed" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">Closed ({closedItems.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading || childrenLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No assignments</h3>
          <p className="text-sm text-muted-foreground">No assignments found for the selected tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const overdue = item.dueDate && new Date(item.dueDate) < now && item.status !== "closed"
              const isExpanded = expandedId === item.id
              const sub = getSubmissionFor(item.id)
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card
                    className={cn("glass-card border-0 cursor-pointer transition-all", isExpanded && "ring-1 ring-primary/20")}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span>{item.subject}</span>
                              <span className="capitalize">{item.type}</span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" /> Due {formatDate(item.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {sub ? (
                            <Badge className={sub.status === "graded" ? "bg-green-500/15 text-green-600" : "bg-blue-500/15 text-blue-600"}>
                              {sub.status === "graded" ? `Score: ${sub.score}%` : "Submitted"}
                            </Badge>
                          ) : (
                            <Badge className={item.status === "closed" ? "bg-muted text-muted-foreground" : overdue ? "bg-red-500/15 text-red-600" : "bg-green-500/15 text-green-600"}>
                              {item.status === "closed" ? "Closed" : overdue ? "Overdue" : "Active"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t mt-3 space-y-3">
                            {item.description && (
                              <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                                {item.description}
                              </div>
                            )}
                            {sub && (
                              <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  {sub.status === "graded" ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-blue-500" />
                                  )}
                                  <span className="font-medium">
                                    {sub.status === "graded" ? `Graded: ${sub.score}%` : "Submitted — awaiting grading"}
                                  </span>
                                </div>
                                {sub.feedback && (
                                  <div className="text-sm text-muted-foreground bg-background rounded-lg p-2">
                                    <span className="font-medium">Teacher's Feedback:</span> {sub.feedback}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground">Submitted {formatDate(sub.createdAt)}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
