"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ClipboardCheck, Users, CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"

import { EmptyState } from "@/components/admin/EmptyState"
import { cn } from "@/lib/utils"

export default function AssignmentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tab, setTab] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ title: "", subject: "", classId: "", dueDate: "", type: "homework", description: "" })

  const fetchData = async () => {
    const [asgnsRes, classesRes] = await Promise.all([fetch("/api/assignments"), fetch("/api/classes")])
    setItems(await asgnsRes.json())
    setClasses(await classesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const update = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", subject: "", classId: "", dueDate: "", type: "homework", description: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ title: item.title, subject: item.subject, classId: item.classId, dueDate: item.dueDate, type: item.type, description: item.description || "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/assignments/${editing.id}` : "/api/assignments"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? "Assignment updated" : "Assignment created"); setSheetOpen(false); fetchData() }
    else toast.error("Failed to save")
  }

  const handleDelete = async (item: any) => {
    const res = await fetch(`/api/assignments/${item.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Deleted"); fetchData() }
  }

  const filtered = items.filter((a) => tab === "all" || a.status === tab)

  const getClassName = (id: string) => classes.find((c) => c.id === id)

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Assignments" description={`${items.length} total`} actionLabel="New Assignment" onAction={openCreate} />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
          <TabsTrigger value="closed" className="flex-1">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No assignments" description="Create your first assignment" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const pct = item.total > 0 ? Math.round((item.submissions / item.total) * 100) : 0
              const overdue = new Date(item.dueDate) < new Date() && item.status !== "closed"
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <ClipboardCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span>{item.subject}</span>
                              <span>{getClassName(item.classId)?.name}{getClassName(item.classId)?.arm ? ` ${getClassName(item.classId).arm}` : ""}</span>
                              <span className="capitalize">{item.type}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Due {item.dueDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={cn(item.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                            {overdue ? "Overdue" : item.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Submissions</span>
                            <span>{item.submissions || 0}/{item.total || 0}</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Assignment" : "New Assignment"}>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70dvh] pb-8">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Algebra Homework Set 1" className="h-12" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="e.g. Mathematics" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => v && update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => v && update("type", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="classwork">Classwork</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} className="h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="resize-none" placeholder="Describe the assignment..." />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Assignment" : "Create Assignment"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}
