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
import { toast } from "sonner"
import { User, Pencil, Trash2, Link2, Unlink, Eye, EyeOff, Save, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, cn } from "@/lib/utils"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className="text-sm">{value || <span className="italic text-muted-foreground/40">Not set</span>}</p>
    </div>
  )
}

export default function ParentsPage() {
  const [parents, setParents] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkParentId, setLinkParentId] = useState<string | null>(null)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [linkStudentId, setLinkStudentId] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailParent, setDetailParent] = useState<any>(null)
  const [detailEditing, setDetailEditing] = useState(false)
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailForm, setDetailForm] = useState({
    name: "", email: "", phone: "", image: "", status: "active"
  })

  const fetchData = async () => {
    const [parentsRes, studentsRes, linksRes] = await Promise.all([
      fetch("/api/parents"),
      fetch("/api/students"),
      fetch("/api/parent-links"),
    ])
    setParents(await parentsRes.json())
    setStudents(await studentsRes.json())
    setLinks(await linksRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", email: "", phone: "", password: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ name: item.name, email: item.email, phone: item.phone || "", password: "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const payload: any = { name: form.name, email: form.email, phone: form.phone }
      if (form.password) payload.password = form.password
      const res = await fetch(`/api/parents/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) { toast.success("Parent updated"); setSheetOpen(false); fetchData() }
      else { toast.error("Failed to update parent") }
    } else {
      if (!form.password) { toast.error("Password is required"); return }
      const res = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success("Parent created"); setSheetOpen(false); fetchData() }
      else { const d = await res.json(); toast.error(d.error || "Failed to create parent") }
    }
  }

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/parents/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Parent deleted"); fetchData() }
    else { toast.error("Failed to delete parent") }
    setConfirmDelete(null)
  }

  const openLinkDialog = (parentId: string) => {
    setLinkParentId(parentId)
    setLinkStudentId("")
    setLinkDialogOpen(true)
  }

  const handleLinkStudent = async () => {
    if (!linkParentId || !linkStudentId) { toast.error("Select a student"); return }
    const res = await fetch("/api/parent-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: linkParentId, studentId: linkStudentId }),
    })
    if (res.ok) { toast.success("Student linked"); setLinkDialogOpen(false); fetchData() }
    else { toast.error("Failed to link student") }
  }

  const handleUnlink = async (linkId: string) => {
    const res = await fetch(`/api/parent-links/${linkId}`, { method: "DELETE" })
    if (res.ok) { toast.success("Student unlinked"); fetchData() }
    else { toast.error("Failed to unlink student") }
  }

  const openDetail = (item: any) => {
    setDetailParent(item)
    setDetailForm({
      name: item.name || "", email: item.email || "",
      phone: item.phone || "", image: item.image || "",
      status: item.status || "active"
    })
    setDetailEditing(false)
    setDetailOpen(true)
  }

  const saveDetail = async () => {
    if (!detailParent) return
    setDetailSaving(true)
    try {
      const payload: any = { name: detailForm.name, email: detailForm.email, phone: detailForm.phone }
      const res = await fetch(`/api/parents/${detailParent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success("Parent updated")
        setDetailOpen(false)
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || "Failed to save")
      }
    } catch {
      toast.error("Failed to save parent details")
    }
    setDetailSaving(false)
  }

  const getParentLinks = (parentId: string) => links.filter((l: any) => l.parentId === parentId)

  const getStudentName = (studentId: string) => {
    const s = students.find((st: any) => st.id === studentId)
    return s ? `${s.firstName} ${s.lastName}` : studentId
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Parents" description="Manage parent accounts and link them to students" actionLabel="Add Parent" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Parent" description={`Permanently delete ${confirmDelete?.name}? This cannot be undone and will unlink all students.`} />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Student</DialogTitle>
            <DialogDescription>Select a student to link to this parent</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Student</Label>
              <Select value={linkStudentId} onValueChange={(v) => v && setLinkStudentId(v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.filter((s: any) => !getParentLinks(linkParentId || "").find((l: any) => l.studentId === s.id)).map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLinkStudent} size="lg" className="animated-gradient w-full border-0 text-white">
              <Link2 className="mr-2 h-4 w-4" /> Link Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <User className="h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">No parents found</p>
          <p className="text-sm">Add a parent to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {parents.map((parent, i) => {
              const parentLinks = getParentLinks(parent.id)
              return (
                <motion.div key={parent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="glass-card border-0 cursor-pointer transition-shadow hover:shadow-md" onClick={() => openDetail(parent)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="h-10 w-10 shrink-0">
                            {parent.image ? <AvatarImage src={parent.image} /> : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(parent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{parent.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span>{parent.email}</span>
                              {parent.phone && <><span className="opacity-30">|</span><span>{parent.phone}</span></>}
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {parentLinks.length} linked student{parentLinks.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            {parentLinks.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {parentLinks.map((link: any) => (
                                  <Badge key={link.id} variant="secondary" className="text-[10px] px-2 py-0.5 gap-1 pr-1">
                                    <span className="truncate max-w-[120px]">{getStudentName(link.studentId)}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleUnlink(link.id) }} className="hover:text-destructive ml-0.5">
                                      <Unlink className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openLinkDialog(parent.id) }} title="Link student">
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(parent) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-danger" onClick={(e) => { e.stopPropagation(); handleDelete(parent) }}>
                            <Trash2 className="h-4 w-4" />
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

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Parent" : "New Parent"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="e.g. John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="parent@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{editing ? "New Password (leave blank to keep current)" : "Password"}</Label>
            <Input id="password" type="text" placeholder={editing ? "Leave blank to keep current" : "Set initial password"} value={form.password} onChange={(e) => update("password", e.target.value)} className="h-12" required={!editing} />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Parent" : "Create Parent"}
          </Button>
        </form>
      </FormSheet>

      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); setDetailEditing(false) } }}>
        <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader className="flex-row items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle>{detailParent?.name}</DialogTitle>
              <DialogDescription>Parent Account</DialogDescription>
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
              <Avatar className="h-16 w-16 shrink-0">
                {detailForm.image ? <AvatarImage src={detailForm.image} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(detailForm.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-base">{detailForm.name}</p>
                <p className="text-xs text-muted-foreground">{detailForm.email}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Contact Information</h4>
              {detailEditing ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground/70">Full Name</Label>
                    <Input value={detailForm.name} onChange={(e) => setDetailForm((p) => ({ ...p, name: e.target.value }))} className="h-10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground/70">Email</Label>
                      <Input type="email" value={detailForm.email} onChange={(e) => setDetailForm((p) => ({ ...p, email: e.target.value }))} className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground/70">Phone</Label>
                      <Input value={detailForm.phone} onChange={(e) => setDetailForm((p) => ({ ...p, phone: e.target.value }))} className="h-10" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <DetailField label="Full Name" value={detailForm.name} />
                  <DetailField label="Email" value={detailForm.email} />
                  <DetailField label="Phone" value={detailForm.phone} />
                </div>
              )}
            </div>

            {/* Linked Students */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Linked Students</h4>
              {detailParent && (() => {
                const parentLinks = getParentLinks(detailParent.id)
                return parentLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {parentLinks.map((link: any) => (
                      <Badge key={link.id} variant="secondary" className="text-xs px-2.5 py-1">
                        {getStudentName(link.studentId)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground/40">No linked students</p>
                )
              })()}
            </div>
          </div>

          {detailEditing && (
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => { setDetailEditing(false); openDetail(detailParent) }}>
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
