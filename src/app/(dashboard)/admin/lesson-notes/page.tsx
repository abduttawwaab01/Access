"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle, XCircle, FileText, Search, Eye, X, ChevronDown, ChevronRight } from "lucide-react"

interface LessonNote {
  id: string; title: string; subject: string; classId: string; term: string; week: string
  content: string; resources: string; status: string; createdBy: string; createdAt: string; quiz?: any[]
  teacherName?: string; className?: string
}

export default function AdminLessonNotes() {
  const [notes, setNotes] = useState<LessonNote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const teachers: any[] = []
  const classes: any[] = []

  useEffect(() => {
    fetch("/api/lesson-notes").then(r => r.json()).then(data => {
      setNotes(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const approve = async (id: string) => {
    await fetch("/api/lesson-notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "approved" }) })
    setNotes(prev => prev.map(n => n.id === id ? { ...n, status: "approved" } : n))
    toast.success("Lesson note approved")
  }

  const reject = async (id: string) => {
    await fetch("/api/lesson-notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "rejected" }) })
    setNotes(prev => prev.map(n => n.id === id ? { ...n, status: "rejected" } : n))
    toast.success("Lesson note rejected")
  }

  const filtered = notes.filter(n => {
    if (statusFilter !== "all" && n.status !== statusFilter) return false
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.subject?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-4 md:p-6 space-y-4">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
        <FileText className="w-6 h-6" /> Lesson Notes
      </motion.h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-3 py-2 rounded-lg border bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No lesson notes found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{note.title}</h3>
                        <Badge className={note.status === "approved" ? "bg-green-500/10 text-green-500" : note.status === "rejected" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}>
                          {note.status}
                        </Badge>
                        {note.quiz && note.quiz.length > 0 && <Badge variant="outline">Quiz: {note.quiz.length} Q</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {note.subject} | Week {note.week} | {note.term} | {note.createdAt?.split("T")[0]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {note.status !== "approved" && (
                        <Button variant="ghost" className="text-green-500" onClick={() => approve(note.id)}><CheckCircle className="w-4 h-4" /></Button>
                      )}
                      {note.status !== "rejected" && (
                        <Button variant="ghost" className="text-red-500" onClick={() => reject(note.id)}><XCircle className="w-4 h-4" /></Button>
                      )}
                      <Button variant="ghost" onClick={() => setExpanded(expanded === note.id ? null : note.id)}>
                        {expanded === note.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  {expanded === note.id && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: note.content }} />
                      {note.resources && (
                        <div>
                          <p className="text-sm font-medium">Resources:</p>
                          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: note.resources }} />
                        </div>
                      )}
                      {note.quiz && note.quiz.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Quiz Questions ({note.quiz.length}):</p>
                          <div className="space-y-2 mt-1">
                            {note.quiz.map((q: any, i: number) => (
                              <div key={i} className="text-sm p-2 rounded bg-muted/50">
                                <p><strong>Q{i + 1}:</strong> {q.question} <Badge variant="outline" className="ml-1 text-xs">{q.type}</Badge></p>
                                {q.type === "MCQ" && q.options && <p className="text-muted-foreground ml-4">Options: {q.options.join(", ")}</p>}
                                <p className="text-muted-foreground ml-4">Answer: {q.correctAnswer} ({q.points || 1}pt)</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
