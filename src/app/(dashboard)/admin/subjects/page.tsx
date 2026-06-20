"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"

export default function SubjectsPage() {
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterClass, setFilterClass] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: "", code: "", classId: "" })

  const fetchData = async () => {
    const [subjectsRes, classesRes] = await Promise.all([
      fetch("/api/subjects"),
      fetch("/api/classes"),
    ])
    setItems(await subjectsRes.json())
    setClasses(await classesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", code: "", classId: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ name: item.name, code: item.code || "", classId: item.classId || "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/subjects/${editing.id}` : "/api/subjects"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? "Subject updated" : "Subject created")
      setSheetOpen(false)
      fetchData()
    } else {
      toast.error("Failed to save subject")
    }
  }

  const handleDelete = async (item: any) => {
    const res = await fetch(`/api/subjects/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Subject deleted")
      fetchData()
    }
  }

  const filtered = filterClass === "all" ? items : items.filter((s) => s.classId === filterClass)
  const getClassName = (id: string) => classes.find((c) => c.id === id)

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Subjects" description="Manage subjects offered across classes" actionLabel="Add Subject" onAction={openCreate} />

      {classes.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <Button variant={filterClass === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterClass("all")} className="shrink-0 rounded-full">
            All
          </Button>
          {classes.map((c) => (
            <Button key={c.id} variant={filterClass === c.id ? "default" : "outline"} size="sm" onClick={() => setFilterClass(c.id)} className="shrink-0 rounded-full">
              {c.name}{c.arm ? ` ${c.arm}` : ""}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No subjects found" description={filterClass !== "all" ? "No subjects for this class" : "Add your first subject"} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const cls = getClassName(item.classId)
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {item.code && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.code}</Badge>}
                              {cls && <span>{cls.name}{cls.arm ? ` ${cls.arm}` : ""}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Subject" : "New Subject"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input id="name" placeholder="e.g. Mathematics" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input id="code" placeholder="e.g. MTH101" value={form.code} onChange={(e) => update("code", e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classId">Class</Label>
              <Select value={form.classId} onValueChange={(v) => update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Subject" : "Create Subject"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}
