"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { ClipboardCheck, CalendarDays, BookOpen, Send, CheckCircle2, XCircle, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function StudentAssignmentsPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("active")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Submit dialog
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitAssignment, setSubmitAssignment] = useState<any>(null)
  const [submitContent, setSubmitContent] = useState("")
  const [submitFileUrl, setSubmitFileUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const studRes = await fetch(`/api/students?userId=${userId}`)
      if (!studRes.ok) { setLoading(false); return }
      const student = await studRes.json()
      if (!student?.classId) { setLoading(false); return }
      const [asgnsRes, clsRes, subsRes] = await Promise.all([
        fetch(`/api/assignments?classId=${student.classId}`),
        fetch("/api/classes"),
        fetch(`/api/submissions?studentId=${student.id}`),
      ])
      const assignmentsData = await asgnsRes.json()
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      const classesData = await clsRes.json()
      setClasses(Array.isArray(classesData) ? classesData : [])
      const subsData = await subsRes.json()
      const subs = Array.isArray(subsData) ? subsData : (subsData.data || [])
      setSubmissions(subs)
      setLoading(false)
    }
    load()
  }, [userId])

  const getClassName = (id: string) => classes.find((c) => c.name === id || c.id === id)

  const getSubmissionFor = (assignmentId: string) => submissions.find((s) => s.assignmentId === assignmentId)

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

  const openSubmit = (item: any) => {
    setSubmitAssignment(item)
    setSubmitContent("")
    setSubmitFileUrl("")
    setSubmitOpen(true)
  }

  const handleSubmit = async () => {
    if (!submitAssignment || !submitContent.trim()) {
      toast.error("Please enter your submission content")
      return
    }
    setSubmitting(true)
    const studRes = await fetch(`/api/students?userId=${userId}`)
    const student = studRes.ok ? await studRes.json() : null
    if (!student?.id) {
      toast.error("Could not identify student")
      setSubmitting(false)
      return
    }
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: submitAssignment.id,
        studentId: student.id,
        content: submitContent,
        fileUrl: submitFileUrl || null,
        status: "submitted",
      }),
    })
    if (res.ok) {
      const newSub = await res.json()
      setSubmissions((prev) => [...prev, newSub])
      toast.success("Assignment submitted!")
      setSubmitOpen(false)
    } else {
      const err = await res.json().catch(() => ({ error: "Failed to submit" }))
      toast.error(err.error || "Failed to submit")
    }
    setSubmitting(false)
  }

  const formatDate = (d: string | Date) => {
    if (!d) return ""
    const date = new Date(d)
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Assignments</h2>
        <p className="text-sm text-muted-foreground">View, submit, and track your class assignments</p>
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
                              {sub.status === "graded" ? `Graded: ${sub.score}%` : "Submitted"}
                            </Badge>
                          ) : (
                            <Badge className={item.status === "closed" ? "bg-muted text-muted-foreground" : overdue ? "bg-red-500/15 text-red-600" : "bg-green-500/15 text-green-600"}>
                              {item.status === "closed" ? "Closed" : overdue ? "Overdue" : "Active"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {item.submissions !== undefined && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Submissions</span>
                              <span>{item.submissions || 0}/{item.total || 0}</span>
                            </div>
                            <Progress value={item.total > 0 ? Math.round((item.submissions / item.total) * 100) : 0} className="h-1.5" />
                          </div>
                        </div>
                      )}
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
                                    <span className="font-medium">Feedback:</span> {sub.feedback}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground">Submitted {formatDate(sub.createdAt)}</p>
                              </div>
                            )}
                            {!sub && item.status !== "closed" && (
                              <Button
                                size="sm"
                                className="animated-gradient border-0 text-white shadow-lg shadow-primary/25"
                                onClick={(e) => { e.stopPropagation(); openSubmit(item) }}
                              >
                                <Send className="h-3.5 w-3.5 mr-1" /> Submit Assignment
                              </Button>
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

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit: {submitAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Work</Label>
              <Textarea
                placeholder="Write your answer or paste your work here..."
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label>File URL (optional)</Label>
              <Input
                placeholder="Link to Google Doc, Drive, etc."
                value={submitFileUrl}
                onChange={(e) => setSubmitFileUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose>
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={submitting || !submitContent.trim()} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              {submitting ? "Submitting..." : <><Send className="h-4 w-4 mr-1" /> Submit</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
