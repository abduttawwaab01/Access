"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Users, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"

const sections = ["Science", "Arts", "Commerce", "Technology", "General"]

export default function ClassesPage() {
  const [items, setItems] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: "", arm: "", section: "", levelId: "" })

  const fetchItems = async () => {
    const [cRes, lRes] = await Promise.all([fetch("/api/classes"), fetch("/api/levels")])
    const data = await cRes.json()
    const lvlData = await lRes.json()
    setItems(data)
    setLevels(lvlData.map((sl: any) => sl.level))
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", arm: "", section: "", levelId: "" })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ name: item.name, arm: item.arm || "", section: item.section || "", levelId: item.levelId || "" })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/classes/${editing.id}` : "/api/classes"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? "Class updated" : "Class created")
      setSheetOpen(false)
      fetchItems()
    } else {
      toast.error("Failed to save class")
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/classes/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Class deleted"); fetchItems() }
    setConfirmDelete(null)
  }

  const grouped = items.reduce((acc: any, item: any) => {
    if (!acc[item.name]) acc[item.name] = []
    acc[item.name].push(item)
    return acc
  }, {})

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Classes" description="Manage classes, arms, and streams" actionLabel="Add Class" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Class" description={`Permanently delete ${confirmDelete?.name}? This cannot be undone.`} />
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No classes yet" description="Create your first class to organize students" />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([grade, classList]: [string, any], gi) => (
            <div key={grade}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{grade}</h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {(classList as any[]).map((item: any, i: number) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="glass-card border-0">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{item.name}{item.arm ? ` ${item.arm}` : ""}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  {item.level?.name && <span>{item.level.name}</span>}
                                  {item.section && <span>{item.section}</span>}
                                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.studentCount || 0} students</span>
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
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Class" : "New Class"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Grade/Class Name</Label>
            <Input id="name" placeholder="e.g. Grade 10" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="arm">Arm/Stream</Label>
              <Input id="arm" placeholder="e.g. A, B, C" value={form.arm} onChange={(e) => update("arm", e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={form.section} onValueChange={(v) => update("section", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={form.levelId} onValueChange={(v) => update("levelId", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {levels.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Class" : "Create Class"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}
