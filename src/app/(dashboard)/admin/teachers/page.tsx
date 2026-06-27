"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X, BookOpen, Check, Eye, EyeOff, Save, CalendarIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { getInitials, cn } from "@/lib/utils"

const departments = ["Science", "Mathematics", "Arts", "Commerce", "Technology", "Languages", "Physical Education", "Administration"]
const roles = ["teacher", "admin", "librarian", "counselor", "support"]

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className="text-sm">{value || <span className="italic text-muted-foreground/40">Not set</span>}</p>
    </div>
  )
}

export default function TeachersPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "teacher", department: "", password: "" })
  const [formClassIds, setFormClassIds] = useState<string[]>([])
  const [formSubjectIds, setFormSubjectIds] = useState<string[]>([])
  const [formIsClassTeacher, setFormIsClassTeacher] = useState(false)

  const [assignSheetOpen, setAssignSheetOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<any | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [existingAssign, setExistingAssign] = useState<any | null>(null)
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [isClassTeacher, setIsClassTeacher] = useState(false)
  const [savingAssign, setSavingAssign] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailStaff, setDetailStaff] = useState<any>(null)
  const [detailEditing, setDetailEditing] = useState(false)
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailForm, setDetailForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
    gender: "", address: "", role: "teacher", department: "", qualification: "",
    employmentDate: "", salary: "", passportPhoto: "", status: "active"
  })

  const fetchItems = async () => {
    const res = await fetch("/api/staff")
    setItems(await res.json())
    setLoading(false)
  }

  const fetchClassesAndSubjects = async () => {
    const [cRes, sRes, lRes] = await Promise.all([fetch("/api/classes"), fetch("/api/subjects"), fetch("/api/levels")])
    setClasses(await cRes.json())
    setSubjects(await sRes.json())
    setLevels(await lRes.json())
  }

  useEffect(() => { fetchItems(); fetchClassesAndSubjects() }, [])

  const openAssign = async (item: any) => {
    setAssignTarget(item)
    setSelectedClassIds([])
    setSelectedSubjectIds([])
    setIsClassTeacher(false)
    setExistingAssign(null)
    try {
      const res = await fetch(`/api/teacher-assignments?teacherId=${item.id}`)
      const data = await res.json()
      if (data?.classIds) {
        setExistingAssign(data)
        setSelectedClassIds(data.classIds || [])
        setSelectedSubjectIds(data.subjectIds || [])
        setIsClassTeacher(data.isClassTeacher || false)
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

  const openDetail = (item: any) => {
    setDetailStaff(item)
    setDetailForm({
      firstName: item.firstName || "", lastName: item.lastName || "",
      email: item.email || "", phone: item.phone || "",
      dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split("T")[0] : "",
      gender: item.gender || "", address: item.address || "",
      role: item.role || "teacher", department: item.department || "",
      qualification: item.qualification || "",
      employmentDate: item.employmentDate ? item.employmentDate.split("T")[0] : "",
      salary: item.salary?.toString() || "", passportPhoto: item.passportPhoto || "",
      status: item.status || "active"
    })
    setDetailEditing(false)
    setDetailOpen(true)
  }

  const saveDetail = async () => {
    if (!detailStaff) return
    setDetailSaving(true)
    try {
      const body = { ...detailForm, salary: detailForm.salary ? Number(detailForm.salary) : null }
      const res = await fetch(`/api/staff/${detailStaff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        toast.success("Staff updated")
        setDetailOpen(false)
        fetchItems()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || "Failed to save")
      }
    } catch {
      toast.error("Failed to save staff details")
    }
    setDetailSaving(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ firstName: "", lastName: "", email: "", role: "teacher", department: "", password: "" })
    setFormClassIds([])
    setFormSubjectIds([])
    setFormIsClassTeacher(false)
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
    const payload = editing
      ? form
      : { ...form, classIds: formClassIds, subjectIds: formSubjectIds, isClassTeacher: formIsClassTeacher }
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
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
                <Card className="glass-card border-0 cursor-pointer transition-shadow hover:shadow-md" onClick={() => openDetail(item)}>
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
                          {item.status && (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", item.status === "active" ? "text-success border-success/30" : "text-muted-foreground")}>
                              {item.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" title="Assign classes & subjects" onClick={(e) => { e.stopPropagation(); openAssign(item) }}>
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(item) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger" onClick={(e) => { e.stopPropagation(); handleDelete(item) }}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          {form.role === "teacher" && !editing && (
            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-medium">Class & Subject Assignments</p>
              <div className="space-y-2">
                <Label>Classes</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {classes.map((c) => {
                    const active = formClassIds.includes(c.id)
                    return (
                      <button key={c.id} type="button" onClick={() => {
                        const was = formClassIds.includes(c.id)
                        setFormClassIds((prev) => was ? prev.filter((id) => id !== c.id) : [...prev, c.id])
                        if (was) setFormSubjectIds((prev) => prev.filter((sid) => {
                          const sub = subjects.find((s) => s.id === sid)
                          return sub && formClassIds.filter((id) => id !== c.id).includes(sub.classId)
                        }))
                      }}
                        className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-all", active ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/30")}>
                        <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", active ? "border-primary bg-primary text-white" : "border-muted-foreground/30")}>
                          {active && <Check className="h-3 w-3" />}
                        </div>
                        {c.name} {c.arm && <span className="text-muted-foreground">- {c.arm}</span>}
                        {c.level && <span className="text-[10px] text-muted-foreground ml-auto">{c.level.name}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subjects</Label>
                {(() => {
                  const fs = formClassIds.length ? subjects.filter((s) => formClassIds.includes(s.classId)) : []
                  return fs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Select at least one class to see available subjects.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {fs.map((s) => {
                        const active = formSubjectIds.includes(s.id)
                        return (
                          <button key={s.id} type="button" onClick={() => setFormSubjectIds((prev) => prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
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
                  )
                })()}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <Label className="text-sm font-medium">Class Teacher</Label>
                  <p className="text-xs text-muted-foreground">Mark as homeroom teacher</p>
                </div>
                <Switch checked={formIsClassTeacher} onCheckedChange={setFormIsClassTeacher} />
              </div>
            </div>
          )}
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Staff" : "Create Staff"}
          </Button>
        </form>
      </FormSheet>

      <FormSheet open={assignSheetOpen} onOpenChange={setAssignSheetOpen} title={assignTarget ? `Assign: ${assignTarget.firstName} ${assignTarget.lastName}` : "Class & Subject Assignments"}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Classes</Label>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(() => {
                const grouped: Record<string, any[]> = {}
                for (const c of classes) {
                  const key = c.level?.name || "Other"
                  if (!grouped[key]) grouped[key] = []
                  grouped[key].push(c)
                }
                return Object.entries(grouped).map(([levelName, clsList]) => (
                  <div key={levelName}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">{levelName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {clsList.map((c) => {
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
                ))
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subjects</Label>
            {filteredSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Select at least one class to see available subjects.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

          <div className="flex items-center justify-between rounded-xl border border-border p-3 flex-wrap gap-2">
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

      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); setDetailEditing(false) } }}>
        <DialogContent className="sm:max-w-xl max-h-[85dvh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader className="flex-row items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle>{detailStaff?.firstName} {detailStaff?.lastName}</DialogTitle>
              <DialogDescription>{detailStaff?.staffId}</DialogDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {detailEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setDetailEditing(false)}>
                  <EyeOff className="h-3.5 w-3.5 mr-1" /> View
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setDetailEditing(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              )}
              <button onClick={() => { setDetailOpen(false); setDetailEditing(false) }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* Photo + Status + Role */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted">
                {detailForm.passportPhoto ? (
                  <img src={detailForm.passportPhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                    {getInitials(`${detailForm.firstName} ${detailForm.lastName}`)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-base">{detailForm.firstName} {detailForm.lastName}</p>
                <p className="text-xs text-muted-foreground">{detailStaff?.staffId}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {detailEditing ? (
                  <Select value={detailForm.status} onValueChange={(v) => setDetailForm((p) => ({ ...p, status: v || "active" }))}>
                    <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={cn("text-xs px-2 py-0.5", detailForm.status === "active" ? "text-success border-success/30" : "text-muted-foreground")}>
                    {detailForm.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Personal Information</h4>
              {detailEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">First Name</Label>
                    <Input value={detailForm.firstName} onChange={(e) => setDetailForm((p) => ({ ...p, firstName: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Last Name</Label>
                    <Input value={detailForm.lastName} onChange={(e) => setDetailForm((p) => ({ ...p, lastName: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Date of Birth</Label>
                    <Input type="date" value={detailForm.dateOfBirth} onChange={(e) => setDetailForm((p) => ({ ...p, dateOfBirth: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Gender</Label>
                    <Select value={detailForm.gender} onValueChange={(v) => setDetailForm((p) => ({ ...p, gender: v || "" }))}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailField label="First Name" value={detailForm.firstName} />
                  <DetailField label="Last Name" value={detailForm.lastName} />
                  <DetailField label="Date of Birth" value={detailForm.dateOfBirth ? new Date(detailForm.dateOfBirth + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""} />
                  <DetailField label="Gender" value={detailForm.gender} />
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Contact Information</h4>
              {detailEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Email</Label>
                    <Input type="email" value={detailForm.email} onChange={(e) => setDetailForm((p) => ({ ...p, email: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Phone</Label>
                    <Input value={detailForm.phone} onChange={(e) => setDetailForm((p) => ({ ...p, phone: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[11px] text-muted-foreground/70">Address</Label>
                    <textarea value={detailForm.address} onChange={(e) => setDetailForm((p) => ({ ...p, address: e.target.value }))} className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" rows={2} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailField label="Email" value={detailForm.email} className="sm:col-span-2" />
                  <DetailField label="Phone" value={detailForm.phone} />
                  <DetailField label="Address" value={detailForm.address} className="sm:col-span-3" />
                </div>
              )}
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Professional Information</h4>
              {detailEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Role</Label>
                    <Select value={detailForm.role} onValueChange={(v) => setDetailForm((p) => ({ ...p, role: v || "teacher" }))}>
                      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Department</Label>
                    <Select value={detailForm.department} onValueChange={(v) => setDetailForm((p) => ({ ...p, department: v || "" }))}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Qualification</Label>
                    <Input value={detailForm.qualification} onChange={(e) => setDetailForm((p) => ({ ...p, qualification: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Employment Date</Label>
                    <Input type="date" value={detailForm.employmentDate} onChange={(e) => setDetailForm((p) => ({ ...p, employmentDate: e.target.value }))} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Salary</Label>
                    <Input type="number" min="0" step="0.01" value={detailForm.salary} onChange={(e) => setDetailForm((p) => ({ ...p, salary: e.target.value }))} className="h-10" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailField label="Role" value={detailForm.role} className="capitalize" />
                  <DetailField label="Department" value={detailForm.department} />
                  <DetailField label="Qualification" value={detailForm.qualification} />
                  <DetailField label="Employment Date" value={detailForm.employmentDate ? new Date(detailForm.employmentDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""} />
                  <DetailField label="Staff ID" value={detailStaff?.staffId} />
                  <DetailField label="Salary" value={detailForm.salary ? `₦${Number(detailForm.salary).toLocaleString()}` : ""} />
                </div>
              )}
            </div>
          </div>

          {detailEditing && (
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => { setDetailEditing(false); openDetail(detailStaff) }}>
                Cancel
              </Button>
              <Button onClick={saveDetail} disabled={detailSaving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                {detailSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</> : <><Save className="h-4 w-4 mr-1" /> Save Changes</>}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
