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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X, Filter, ImageIcon, Loader2, Eye, EyeOff, Save, CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { getInitials, cn } from "@/lib/utils"
import { compressAndUpload } from "@/lib/imageUtils"

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className="text-sm">{value || <span className="italic text-muted-foreground/40">Not set</span>}</p>
    </div>
  )
}

export default function StudentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", gender: "", classId: "", passportPhoto: "", password: "" })
  const [photoUploading, setPhotoUploading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailStudent, setDetailStudent] = useState<any>(null)
  const [detailEditing, setDetailEditing] = useState(false)
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailForm, setDetailForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
    gender: "", address: "", bloodGroup: "", medicalNotes: "",
    enrollmentDate: "", classId: "", status: "active", passportPhoto: ""
  })

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
    setForm({ firstName: "", lastName: "", email: "", gender: "", classId: "", passportPhoto: "", password: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ firstName: item.firstName, lastName: item.lastName, email: item.email || "", gender: item.gender || "", classId: item.classId || "", passportPhoto: item.passportPhoto || "", password: "" })
    setSheetOpen(true)
  }

  const openDetail = (item: any) => {
    setDetailStudent(item)
    setDetailForm({
      firstName: item.firstName || "", lastName: item.lastName || "",
      email: item.email || "", phone: item.phone || "",
      dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split("T")[0] : "",
      gender: item.gender || "", address: item.address || "",
      bloodGroup: item.bloodGroup || "", medicalNotes: item.medicalNotes || "",
      enrollmentDate: item.enrollmentDate ? item.enrollmentDate.split("T")[0] : "",
      classId: item.classId || "", status: item.status || "active",
      passportPhoto: item.passportPhoto || ""
    })
    setDetailEditing(false)
    setDetailOpen(true)
  }

  const saveDetail = async () => {
    if (!detailStudent) return
    setDetailSaving(true)
    try {
      const res = await fetch(`/api/students/${detailStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailForm)
      })
      if (res.ok) {
        toast.success("Student updated")
        setDetailOpen(false)
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || "Failed to save")
      }
    } catch {
      toast.error("Failed to save student details")
    }
    setDetailSaving(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const url = await compressAndUpload(file, { maxWidth: 300, quality: 0.6, format: "webp", folder: "passports" })
      update("passportPhoto", url)
      toast.success("Photo uploaded")
    } catch {
      toast.error("Photo upload failed")
    }
    setPhotoUploading(false)
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

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/students/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Student deleted"); fetchItems() }
    setConfirmDelete(null)
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
                <Card className="glass-card border-0 cursor-pointer transition-shadow hover:shadow-md" onClick={() => openDetail(item)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={item.passportPhoto} />
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
            <Label>Passport Photo</Label>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                {form.passportPhoto ? (
                  <img src={form.passportPhoto} alt="Passport" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <Label htmlFor="passportUpload" className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-all hover:bg-muted">
                  {photoUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <>Choose File</>}
                </span>
                <input id="passportUpload" type="file" accept="image/*" className="hidden" disabled={photoUploading} onChange={handlePhotoUpload} />
              </Label>
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
          <div className="space-y-2">
            <Label>Password {editing ? "(leave blank to keep current)" : ""}</Label>
            <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="h-12" placeholder={editing ? "••••••••" : "Set password"} />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Student" : "Create Student"}
          </Button>
        </form>
      </FormSheet>

      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); setDetailEditing(false) } }}>
        <DialogContent className="sm:max-w-xl max-h-[85dvh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader className="flex-row items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle>{detailStudent?.firstName} {detailStudent?.lastName}</DialogTitle>
              <DialogDescription>{detailStudent?.studentId}</DialogDescription>
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
            {/* Photo + Status */}
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
                <p className="text-xs text-muted-foreground">{detailStudent?.studentId}</p>
              </div>
              {detailEditing ? (
                <Select value={detailForm.status} onValueChange={(v) => setDetailForm((p) => ({ ...p, status: v || "active" }))}>
                  <SelectTrigger className="h-8 w-[120px] ml-auto"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="ml-auto">
                  <Badge variant="outline" className={cn("text-xs px-2 py-0.5", detailForm.status === "active" ? "text-success border-success/30" : "text-muted-foreground")}>
                    {detailForm.status}
                  </Badge>
                </div>
              )}
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

            {/* Academic Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Academic Information</h4>
              {detailEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Class</Label>
                    <Select value={detailForm.classId} onValueChange={(v) => setDetailForm((p) => ({ ...p, classId: v || "" }))}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.arm ? ` ${c.arm}` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Enrollment Date</Label>
                    <Input type="date" value={detailForm.enrollmentDate} onChange={(e) => setDetailForm((p) => ({ ...p, enrollmentDate: e.target.value }))} className="h-10" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailField label="Class" value={classes.find((c) => c.id === detailForm.classId) ? `${classes.find((c) => c.id === detailForm.classId).name}${classes.find((c) => c.id === detailForm.classId).arm ? ` ${classes.find((c) => c.id === detailForm.classId).arm}` : ""}` : ""} />
                  <DetailField label="Enrollment Date" value={detailForm.enrollmentDate ? new Date(detailForm.enrollmentDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""} />
                  <DetailField label="Student ID" value={detailStudent?.studentId} />
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Medical Information</h4>
              {detailEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Blood Group</Label>
                    <Select value={detailForm.bloodGroup} onValueChange={(v) => setDetailForm((p) => ({ ...p, bloodGroup: v || "" }))}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[11px] text-muted-foreground/70">Medical Notes</Label>
                    <textarea value={detailForm.medicalNotes} onChange={(e) => setDetailForm((p) => ({ ...p, medicalNotes: e.target.value }))} className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" rows={2} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailField label="Blood Group" value={detailForm.bloodGroup} />
                  <DetailField label="Medical Notes" value={detailForm.medicalNotes} className="sm:col-span-3" />
                </div>
              )}
            </div>
          </div>

          {detailEditing && (
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => { setDetailEditing(false); openDetail(detailStudent) }}>
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
