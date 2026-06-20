"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X, Filter } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { getInitials, cn } from "@/lib/utils"

export default function StudentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", gender: "", classId: "" })

  const fetchData = async () => {
    const [studentsRes, classesRes] = await Promise.all([fetch("/api/students"), fetch("/api/classes")])
    setItems(await studentsRes.json())
    setClasses(await classesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const update = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const openCreate = () => {
    setEditing(null)
    setForm({ firstName: "", lastName: "", email: "", gender: "", classId: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ firstName: item.firstName, lastName: item.lastName, email: item.email || "", gender: item.gender || "", classId: item.classId || "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/students/${editing.id}` : "/api/students"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? "Student updated" : "Student created")
      setSheetOpen(false)
      fetchData()
    } else toast.error("Failed to save")
  }

  const handleDelete = async (item: any) => {
    const res = await fetch(`/api/students/${item.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Student deleted"); fetchItems() }
  }

  const fetchItems = async () => {
    const res = await fetch("/api/students")
    setItems(await res.json())
  }

  const filtered = items.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    const matchesSearch = !search || name.includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase())
    const matchesClass = filterClass === "all" || s.classId === filterClass
    return matchesSearch && matchesClass
  })

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Students" description={`${items.length} total students`} actionLabel="Add Student" onAction={openCreate} />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={filterClass} onValueChange={(v) => v && setFilterClass(v)}>
          <SelectTrigger className="h-10 w-[130px]">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No students found" description={search ? "Try a different search" : "Add your first student"} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(`${item.firstName} ${item.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.firstName} {item.lastName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.studentId}</span>
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", item.status === "active" ? "text-success border-success/30" : "text-muted-foreground")}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
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
            ))}
          </AnimatePresence>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Student" : "New Student"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="h-12" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => update("classId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Student" : "Create Student"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}
