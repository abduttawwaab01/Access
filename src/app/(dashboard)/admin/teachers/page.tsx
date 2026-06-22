"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X, BookOpen, Check } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { getInitials, cn } from "@/lib/utils"

const departments = ["Science", "Mathematics", "Arts", "Commerce", "Technology", "Languages", "Physical Education", "Administration"]
const roles = ["teacher", "admin", "librarian", "counselor", "support"]

export default function TeachersPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "teacher", department: "", password: "" })

  const [assignSheetOpen, setAssignSheetOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<any | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [existingAssign, setExistingAssign] = useState<any | null>(null)
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [isClassTeacher, setIsClassTeacher] = useState(false)
  const [savingAssign, setSavingAssign] = useState(false)

  const fetchItems = async () => {
    const res = await fetch("/api/staff")
    setItems(await res.json())
    setLoading(false)
  }

  const fetchClassesAndSubjects = async () => {
    const [cRes, sRes] = await Promise.all([fetch("/api/classes"), fetch("/api/subjects")])
    setClasses(await cRes.json())
    setSubjects(await sRes.json())
  }

  useEffect(() => { fetchItems(); fetchClassesAndSubjects() }, [])

  const openAssign = async (item: any) => {
    setAssignTarget(item)
    setSelectedClassIds([])
    setSelectedSubjectIds([])
    setIsClassTeacher(false)
    setExistingAssign(null)
    try {
      const res = await fetch("/api/teacher-assignments")
      const all = await res.json()
      const found = all.find((a: any) => a.teacherId === item.id)
      if (found) {
        setExistingAssign(found)
        setSelectedClassIds(found.classIds || [])
        setSelectedSubjectIds(found.subjectIds || [])
        setIsClassTeacher(found.isClassTeacher || false)
      }
    } catch {}
    setAssignSheetOpen(true)
  }

  const handleSaveAssign = async () => {
    if (!assignTarget) return
    setSavingAssign(true)
    try {
      const res = await fetch("/api/teacher-assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: assignTarget.id, classIds: selectedClassIds, subjectIds: selectedSubjectIds, isClassTeacher }),
      })
      if (res.ok) {
        toast.success("Assignments saved")
        setAssignSheetOpen(false)
      } else toast.error("Failed to save assignments")
    } catch { toast.error("Failed to save assignments") }
    setSavingAssign(false)
  }

  const filteredSubjects = selectedClassIds.length
    ? subjects.filter((s) => selectedClassIds.includes(s.classId))
    : subjects

  const toggleClassId = (id: string) => {
    const wasSelected = selectedClassIds.includes(id)
    const next = wasSelected
      ? selectedClassIds.filter((c) => c !== id)
      : [...selectedClassIds, id]
    setSelectedClassIds(next)
    if (wasSelected) {
      setSelectedSubjectIds((prev) =>
        prev.filter((sid) => {
          const sub = subjects.find((s) => s.id === sid)
          return sub && next.includes(sub.classId)
        })
      )
    }
  }

  const toggleSubjectId = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const update = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const openCreate = () => {
    setEditing(null)
    setForm({ firstName: "", lastName: "", email: "", role: "teacher", department: "", password: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ firstName: item.firstName, lastName: item.lastName, email: item.email || "", role: item.role || "teacher", department: item.department || "", password: "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/staff/${editing.id}` : "/api/staff"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? "Staff updated" : "Staff created")
      setSheetOpen(false)
      fetchItems()
    } else toast.error("Failed to save")
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/staff/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Staff removed"); fetchItems() }
    setConfirmDelete(null)
  }

  const filtered = items.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    return !search || name.includes(search.toLowerCase()) || s.staffId?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Teachers & Staff" description={`${items.length} total staff`} actionLabel="Add Staff" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Staff" description={`Permanently delete ${confirmDelete?.firstName} ${confirmDelete?.lastName}? This cannot be undone.`} />
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No staff found" description={search ? "Try a different search" : "Add your first staff member"} />
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
                          <span className="capitalize">{item.role}</span>
                          {item.department && <span>· {item.department}</span>}
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", item.status === "active" ? "text-success border-success/30" : "text-muted-foreground")}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" title="Assign classes & subjects" onClick={() => openAssign(item)}>
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger" onClick={() => handleDelete(item)}>
                          <Trash2 className="h-4 w-4" />
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

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Staff" : "New Staff Member"}>
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
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select dept" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password {editing ? "(leave blank to keep current)" : ""}</Label>
            <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="h-12" placeholder={editing ? "••••••••" : "Set password"} />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Staff" : "Create Staff"}
          </Button>
        </form>
      </FormSheet>

      <FormSheet open={assignSheetOpen} onOpenChange={setAssignSheetOpen} title={assignTarget ? `Assign: ${assignTarget.firstName} ${assignTarget.lastName}` : "Class & Subject Assignments"}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Classes</Label>
            <div className="grid grid-cols-2 gap-2">
              {classes.map((c) => {
                const active = selectedClassIds.includes(c.id)
                return (
                  <button key={c.id} type="button" onClick={() => toggleClassId(c.id)}
                    className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-all", active ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/30")}>
                    <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", active ? "border-primary bg-primary text-white" : "border-muted-foreground/30")}>
                      {active && <Check className="h-3 w-3" />}
                    </div>
                    {c.name} {c.arm && <span className="text-muted-foreground">- {c.arm}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subjects</Label>
            {filteredSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Select at least one class to see available subjects.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredSubjects.map((s) => {
                  const active = selectedSubjectIds.includes(s.id)
                  return (
                    <button key={s.id} type="button" onClick={() => toggleSubjectId(s.id)}
                      className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-all", active ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/30")}>
                      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", active ? "border-primary bg-primary text-white" : "border-muted-foreground/30")}>
                        {active && <Check className="h-3 w-3" />}
                      </div>
                      <span>{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{s.code}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label className="text-sm font-medium">Class Teacher</Label>
              <p className="text-xs text-muted-foreground">Mark as homeroom teacher for selected classes</p>
            </div>
            <Switch checked={isClassTeacher} onCheckedChange={setIsClassTeacher} />
          </div>

          <Button onClick={handleSaveAssign} disabled={savingAssign} size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {savingAssign ? "Saving..." : "Save Assignments"}
          </Button>
        </div>
      </FormSheet>

    </div>
  )
}
