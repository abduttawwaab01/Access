"use client"

import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"

export default function SessionsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", isCurrent: false })
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [terms, setTerms] = useState<any[]>([])
  const [termForm, setTermForm] = useState({ name: "", startDate: "", endDate: "", isCurrent: false })
  const [editingTerm, setEditingTerm] = useState<any | null>(null)
  const [showTermForm, setShowTermForm] = useState(false)

  const fetchTerms = async (sessionId: string) => {
    const res = await fetch(`/api/terms?sessionId=${sessionId}`)
    setTerms(await res.json())
  }

  const toggleSession = (id: string) => {
    if (expandedSession === id) { setExpandedSession(null); return }
    setExpandedSession(id)
    fetchTerms(id)
  }

  const handleTermSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expandedSession) return
    const url = editingTerm ? `/api/terms/${editingTerm.id}` : "/api/terms"
    const method = editingTerm ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...termForm, sessionId: expandedSession }),
    })
    if (res.ok) {
      toast.success(editingTerm ? "Term updated" : "Term created")
      setShowTermForm(false)
      setEditingTerm(null)
      setTermForm({ name: "", startDate: "", endDate: "", isCurrent: false })
      fetchTerms(expandedSession)
    } else {
      toast.error("Failed to save term")
    }
  }

  const deleteTerm = async (term: any) => {
    const res = await fetch(`/api/terms/${term.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Term deleted"); if (expandedSession) fetchTerms(expandedSession) }
  }

  const fetchItems = async () => {
    const res = await fetch("/api/sessions")
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", startDate: "", endDate: "", isCurrent: false })
    setSheetOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ name: item.name, startDate: item.startDate?.split("T")[0] || "", endDate: item.endDate?.split("T")[0] || "", isCurrent: item.isCurrent })
    setSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/sessions/${editing.id}` : "/api/sessions"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      toast.success(editing ? "Session updated" : "Session created")
      setSheetOpen(false)
      fetchItems()
    } else {
      toast.error("Failed to save session")
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const handleDelete = (item: any) => setConfirmDelete(item)

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/sessions/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Session deleted"); fetchItems() }
    setConfirmDelete(null)
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Academic Sessions" description="Manage school academic sessions and terms" actionLabel="Add Session" onAction={openCreate} />
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Session" description={`Permanently delete ${confirmDelete?.name}? This cannot be undone.`} />
      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No sessions yet" description="Create your first academic session to get started" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`glass-card border-0 overflow-hidden ${item.isCurrent ? "ring-1 ring-primary/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleSession(item.id)}>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.name}</p>
                          {item.isCurrent && <Badge className="bg-primary/10 text-primary text-[10px] border-0">Current</Badge>}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.startDate} - {item.endDate}</span>
                          <span>{item.termCount || 0} terms</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSession(item.id)}>
                          {expandedSession === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {expandedSession === item.id && (
                      <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Terms</h4>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setEditingTerm(null); setTermForm({ name: "", startDate: "", endDate: "", isCurrent: false }); setShowTermForm(!showTermForm) }}>
                            <Plus className="h-3 w-3 mr-1" />Add Term
                          </Button>
                        </div>
                        {showTermForm && (
                          <form onSubmit={handleTermSubmit} className="space-y-2 p-3 rounded-xl bg-muted/30">
                            <Input placeholder="Term name (e.g. First Term)" value={termForm.name} onChange={(e) => setTermForm({ ...termForm, name: e.target.value })} className="h-9 text-sm" required />
                            <div className="grid grid-cols-2 gap-2">
                              <Input type="date" value={termForm.startDate} onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })} className="h-9 text-sm" required />
                              <Input type="date" value={termForm.endDate} onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })} className="h-9 text-sm" required />
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                              <input type="checkbox" checked={termForm.isCurrent} onChange={(e) => setTermForm({ ...termForm, isCurrent: e.target.checked })} />
                              Current term
                            </label>
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" className="h-8 text-xs">{editingTerm ? "Update" : "Create"}</Button>
                              <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowTermForm(false)}>Cancel</Button>
                            </div>
                          </form>
                        )}
                        {terms.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">No terms yet</p>
                        ) : (
                          <div className="space-y-1.5">
                            {terms.map((t) => (
                              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{t.name}</span>
                                  {t.isCurrent && <Badge className="bg-green-500/10 text-green-600 text-[10px] border-0">Current</Badge>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingTerm(t); setTermForm({ name: t.name, startDate: t.startDate?.split("T")[0] || "", endDate: t.endDate?.split("T")[0] || "", isCurrent: t.isCurrent }); setShowTermForm(true) }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-danger" onClick={() => deleteTerm(t)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit Session" : "New Session"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input id="name" placeholder="e.g. 2025/2026 Academic Session" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className="h-12" required />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-border/50 p-3 cursor-pointer">
            <input type="checkbox" checked={form.isCurrent} onChange={(e) => update("isCurrent", e.target.checked)} className="h-4 w-4 accent-primary" />
            <div>
              <p className="text-sm font-medium">Set as current session</p>
              <p className="text-xs text-muted-foreground">This will be the active session across the platform</p>
            </div>
          </label>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            {editing ? "Update Session" : "Create Session"}
          </Button>
        </form>
      </FormSheet>

    </div>
  )
}
