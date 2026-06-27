"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react"
import { ClipboardCheck, CalendarDays, BookOpen, Users, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudentAssignmentsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("active")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const studRes = await fetch(`/api/students?userId=${userId}`)
      if (!studRes.ok) { setLoading(false); return }
      const student = await studRes.json()
      if (!student?.classId) { setLoading(false); return }
      const [asgnsRes, clsRes] = await Promise.all([
        fetch(`/api/assignments?classId=${student.classId}`),
        fetch("/api/classes"),
      ])
      const assignmentsData = await asgnsRes.json()
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      const classesData = await clsRes.json()
      setClasses(Array.isArray(classesData) ? classesData : [])
      setLoading(false)
    }
    load()
  }, [userId])

  const getClassName = (id: string) => classes.find((c) => c.id === id)

  const now = new Date()
  const activeAssignments = assignments.filter((a) => {
    const due = a.dueDate ? new Date(a.dueDate) : null
    return a.status !== "closed" && (!due || due >= now)
  })
  const overdueAssignments = assignments.filter((a) => {
    const due = a.dueDate ? new Date(a.dueDate) : null
    return a.status !== "closed" && due && due < now
  })
  const closedAssignments = assignments.filter((a) => a.status === "closed")

  const filtered = tab === "active" ? activeAssignments : tab === "overdue" ? overdueAssignments : closedAssignments

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Assignments</h2>
        <p className="text-sm text-muted-foreground">View and track your class assignments</p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="active" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            Active ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            Overdue ({overdueAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            Closed ({closedAssignments.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No {tab} assignments</h3>
          <p className="text-sm text-muted-foreground">
            {tab === "active" ? "You have no pending assignments. Great job!" : tab === "overdue" ? "No overdue assignments. You are up to date!" : "No closed assignments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const overdue = new Date(item.dueDate) < now && item.status !== "closed"
              const isExpanded = expandedId === item.id
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
                                <CalendarDays className="h-3 w-3" /> Due {item.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={cn(
                            item.status === "closed" ? "bg-muted text-muted-foreground" : overdue ? "bg-red-500/15 text-red-600" : "bg-green-500/15 text-green-600"
                          )}>
                            {item.status === "closed" ? "Closed" : overdue ? "Overdue" : "Active"}
                          </Badge>
                        </div>
                      </div>
                      {item.submissions !== undefined && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Submissions</span>
                              <span>{item.submissions || 0}/{item.total || 0}</span>
                            </div>
                            <Progress value={item.total > 0 ? Math.round((item.submissions / item.total) * 100) : 0} className="h-1.5" />
                          </div>
                        </div>
                      )}
                      {isExpanded && item.description && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t mt-3">
                            <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                              {item.description}
                            </div>
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
