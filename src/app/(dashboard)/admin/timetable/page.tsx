"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CalendarCheck, Plus, Trash2, DownloadCloud, FileSpreadsheet, FileText, Save, CalendarDays, GraduationCap, Users, School, Palette, CheckCircle, XCircle, Clock, Edit3, Eye, RefreshCw } from "lucide-react"
import { downloadCsv, downloadPng, downloadPdf, downloadDoc } from "@/lib/capture"
import { TimetableExport } from "@/components/timetable/TimetableExport"
import { detectTimetableConflicts } from "@/lib/content-generator"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const TIME_SLOTS = [
  { start: "08:00", end: "08:40" },
  { start: "08:40", end: "09:20" },
  { start: "09:20", end: "10:00" },
  { start: "10:30", end: "11:10" },
  { start: "11:10", end: "11:50" },
  { start: "11:50", end: "12:30" },
  { start: "13:10", end: "13:50" },
]
const TIMETABLE_TYPES = [
  { value: "regular", label: "Regular Class", icon: CalendarDays, color: "text-blue-600 bg-blue-500/10" },
  { value: "exam", label: "Examination", icon: GraduationCap, color: "text-red-600 bg-red-500/10" },
  { value: "event", label: "Special Event", icon: Palette, color: "text-violet-600 bg-violet-500/10" },
  { value: "holiday", label: "Holiday", icon: Clock, color: "text-emerald-600 bg-emerald-500/10" },
]

export default function AdminTimetablePage() {
  const [sets, setSets] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSetId, setSelectedSetId] = useState<string>("")
  const [showSetForm, setShowSetForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const [setForm, setSetForm] = useState({ name: "", type: "regular", classId: "", classLabel: "", term: "", session: "" })
  const [entryForm, setEntryForm] = useState({ day: "Monday", startTime: "08:00", endTime: "08:40", subject: "", room: "", teacherName: "", teacherId: "", isBreak: false, date: "" })

  const selectedSet = sets.find((s) => s.id === selectedSetId)
  const classMap = Object.fromEntries(classes.map((c: any) => [c.id, c.name]))

  const load = async () => {
    setLoading(true)
    const [s, c, sch, t, subj, sess] = await Promise.all([
      fetch("/api/timetable/sets").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()).catch(() => null),
      fetch("/api/staff").then((r) => r.json()).catch(() => []),
      fetch("/api/subjects").then((r) => r.json()).catch(() => []),
      fetch("/api/sessions").then((r) => r.json()).catch(() => []),
    ])
    setSets(Array.isArray(s) ? s : [])
    setClasses(Array.isArray(c) ? c : [])
    setSchool(sch)
    setTeachers(Array.isArray(t) ? t : [])
    setSubjects(Array.isArray(subj) ? subj : [])
    setSessions(Array.isArray(sess) ? sess : [])
    if (!selectedSetId && Array.isArray(s) && s.length > 0) setSelectedSetId(s[0].id)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!selectedSetId) { setEntries([]); return }
    fetch(`/api/timetable?setId=${selectedSetId}`)
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
  }, [selectedSetId])

  const createSet = async () => {
    if (!setForm.name.trim() || !setForm.classId) { toast.error("Name and class are required"); return }
    const cls = classes.find((c: any) => c.id === setForm.classId)
    const res = await fetch("/api/timetable/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...setForm, classLabel: cls?.name || "" }),
    })
    if (res.ok) {
      toast.success("Timetable set created")
      setShowSetForm(false)
      setSetForm({ name: "", type: "regular", classId: "", classLabel: "", term: "", session: "" })
      load()
    } else toast.error("Failed to create set")
  }

  const deleteSet = async (id: string) => {
    if (!confirm("Delete this timetable set and all its entries?")) return
    const res = await fetch(`/api/timetable/sets/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Set deleted")
      if (selectedSetId === id) setSelectedSetId("")
      load()
    } else toast.error("Failed to delete")
  }

  const saveEntry = async () => {
    if (!selectedSetId) return
    setSaving(true)

    try {
      // Build a preview of the new entry for conflict detection
      const newEntry = {
        day: entryForm.day,
        startTime: entryForm.startTime,
        endTime: entryForm.endTime,
        teacherId: entryForm.teacherId || undefined,
        room: entryForm.room || undefined,
        classId: selectedSet?.classId || "",
        id: editingEntry?.id,
      }
      const allForDetection = editingEntry
        ? entries.filter((e: any) => e.id !== editingEntry.id).concat(newEntry)
        : entries.concat(newEntry)
      const conflicts = detectTimetableConflicts(allForDetection)
      if (conflicts.length > 0) {
        toast.error(conflicts[0])
        return
      }

      const body: Record<string, any> = {
        setId: selectedSetId,
        day: entryForm.day,
        startTime: entryForm.startTime,
        endTime: entryForm.endTime,
        subjectName: entryForm.isBreak ? "Break" : entryForm.subject,
        subjectId: subjects.find((s: any) => s.name === entryForm.subject)?.id || "",
        room: entryForm.room,
        teacherName: entryForm.teacherName,
        isBreak: entryForm.isBreak,
        classId: selectedSet?.classId || "",
      }
      if (entryForm.date) body.date = entryForm.date
      if (entryForm.teacherId) body.teacherId = entryForm.teacherId
      const url = editingEntry ? `/api/timetable/${editingEntry.id}` : "/api/timetable"
      const method = editingEntry ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editingEntry ? "Entry updated" : "Entry created")
        if (conflicts.length > 0) {
          toast.warning(`${conflicts.length} conflict(s) detected`)
        }
        setShowEntryForm(false)
        setEditingEntry(null)
        const data = await fetch(`/api/timetable?setId=${selectedSetId}`).then((r) => r.json())
        setEntries(Array.isArray(data) ? data : [])
      } else {
        const errBody = await res.json().catch(() => null)
        toast.error(errBody?.error || "Failed to save entry")
      }
    } catch (err) {
      toast.error("Failed to save entry")
      console.error("saveEntry error:", err)
    }
    setSaving(false)
  }

  const deleteEntry = async (id: string) => {
    const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Entry deleted")
      setEntries(entries.filter((e) => e.id !== id))
    } else toast.error("Failed to delete")
  }

  const openNewEntry = (day?: string, time?: string) => {
    setEditingEntry(null)
    setEntryForm({
      day: day || "Monday",
      startTime: time || "08:00",
      endTime: TIME_SLOTS.find((t) => t.start === (time || "08:00"))?.end || "08:40",
      subject: "",
      room: "",
      teacherName: "",
      teacherId: "",
      isBreak: false,
      date: "",
    })
    setShowEntryForm(true)
  }

  const openEditEntry = (entry: any) => {
    setEditingEntry(entry)
    setEntryForm({
      day: entry.day || "Monday",
      startTime: entry.startTime || "08:00",
      endTime: entry.endTime || "08:40",
      subject: entry.isBreak ? "" : (entry.subjectName || entry.subject || ""),
      room: entry.room || "",
      teacherName: entry.teacherName || "",
      teacherId: entry.teacherId || "",
      isBreak: !!entry.isBreak,
      date: entry.date || "",
    })
    setShowEntryForm(true)
  }

  const getSlot = (day: string, time: string) => entries.find((e) => e.day === day && e.startTime === time)

  // Export
  const handleExportCSV = () => {
    const data = entries.map((e) => ({
      Day: e.day,
      "Start Time": e.startTime,
      "End Time": e.endTime,
      Subject: e.isBreak ? "Break" : (e.subjectName || e.subject || ""),
      Room: e.room || "",
      Teacher: e.teacherName || "",
      Type: e.isBreak ? "Break" : "Class",
    }))
    downloadCsv(data, `${selectedSet?.name || "Timetable"}.csv`)
    toast.success("Exported as CSV")
  }

  const handleExportPNG = async () => {
    if (!exportRef.current) return
    try {
      await downloadPng(exportRef.current, `${selectedSet?.name || "Timetable"}.png`, { scale: 2, backgroundColor: "#ffffff" })
      toast.success("Exported as PNG")
    } catch { toast.error("Export failed") }
  }

  const handleExportPDF = async () => {
    if (!exportRef.current) return
    try {
      await downloadPdf(exportRef.current, `${selectedSet?.name || "Timetable"}.pdf`, { scale: 2, backgroundColor: "#ffffff" })
      toast.success("Exported as PDF")
    } catch { toast.error("Export failed") }
  }

  const subjectColors: Record<string, string> = {
    Mathematics: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Physics: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    Chemistry: "bg-green-500/10 text-green-600 border-green-500/20",
    English: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    History: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  }
  const getSubjectColor = (sub: string) => subjectColors[sub] || "bg-primary/10 text-primary border-primary/20"

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  const isExamType = selectedSet?.type === "exam"
  const columns = isExamType ? ["Date", ...DAYS.map((d) => d.substring(0, 3))] : DAYS

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Timetable Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage class timetables, exam timetables, and events</p>
        </div>
        <Button onClick={() => { setShowSetForm(true); setSetForm({ name: "", type: "regular", classId: "", classLabel: "", term: "", session: "" }) }} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-1" /> New Set
        </Button>
      </motion.div>

      {/* Set selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedSetId} onValueChange={(v) => { if (v) setSelectedSetId(v) }}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select a timetable set..." /></SelectTrigger>
            <SelectContent>
              {sets.length === 0 && <SelectItem value="__none" disabled>No timetable sets yet</SelectItem>}
              {sets.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedSet && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{selectedSet.type}</Badge>
            <Badge variant="outline" className="text-[10px]">{selectedSet.classLabel || classMap[selectedSet.classId] || "All"}</Badge>
            {selectedSet.term && <Badge variant="outline" className="text-[10px]">{selectedSet.term}</Badge>}
            <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500" onClick={() => deleteSet(selectedSetId)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Set
            </Button>
          </div>
        )}
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!selectedSet}><FileSpreadsheet className="h-3.5 w-3.5 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PDF</Button>
        </div>
      </div>

      {/* New Set Modal */}
      <AnimatePresence>
        {showSetForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-0 glass-card border-t-2 border-t-primary/30">
              <CardContent className="p-4 md:p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary" /> New Timetable Set</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Set Name *</Label>
                    <Input value={setForm.name} onChange={(e) => setSetForm({ ...setForm, name: e.target.value })} placeholder="e.g. First Term 2025" />
                  </div>
                  <div>
                    <Label className="text-xs">Type *</Label>
                    <Select value={setForm.type} onValueChange={(v) => { if (v) setSetForm({ ...setForm, type: v }) }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMETABLE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Class *</Label>
                    <Select value={setForm.classId} onValueChange={(v) => { if (v) setSetForm({ ...setForm, classId: v }) }}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Term (optional)</Label>
                    <Select value={setForm.term} onValueChange={(v) => { if (v) setSetForm({ ...setForm, term: v }) }}>
                      <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">First Term</SelectItem>
                        <SelectItem value="Second Term">Second Term</SelectItem>
                        <SelectItem value="Third Term">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Session (optional)</Label>
                    <Select value={setForm.session} onValueChange={(v) => { if (v) setSetForm({ ...setForm, session: v }) }}>
                      <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                      <SelectContent>
                        {sessions.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSetForm(false)}>Cancel</Button>
                  <Button onClick={createSet} className="animated-gradient border-0 text-white">Create Set</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showEntryForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-0 glass-card border-t-2 border-t-emerald-500/30">
              <CardContent className="p-4 md:p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Edit3 className="h-4 w-4 text-emerald-500" /> {editingEntry ? "Edit Entry" : "Add Entry"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">Day</Label>
                    <Select value={entryForm.day} onValueChange={(v) => { if (v) setEntryForm({ ...entryForm, day: v }) }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <Select value={entryForm.startTime} onValueChange={(v) => {
                      if (!v) return
                      const slot = TIME_SLOTS.find((t) => t.start === v)
                      setEntryForm({ ...entryForm, startTime: v, endTime: slot?.end || v })
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t.start} value={t.start}>{t.start}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">End Time</Label>
                    <Input type="time" value={entryForm.endTime} onChange={(e) => setEntryForm({ ...entryForm, endTime: e.target.value })} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={entryForm.isBreak} onChange={(e) => setEntryForm({ ...entryForm, isBreak: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-xs font-medium">Break Period</span>
                    </label>
                  </div>
                  {!entryForm.isBreak && (
                    <>
                      <div>
                        <Label className="text-xs">Subject</Label>
                        <Select value={entryForm.subject} onValueChange={(v) => { if (v) setEntryForm({ ...entryForm, subject: v }) }}>
                          <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                          <SelectContent>
                            {subjects.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Room / Venue</Label>
                        <Input value={entryForm.room} onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })} placeholder="e.g. Room 101" />
                      </div>
                      <div>
                        <Label className="text-xs">Teacher / Supervisor</Label>
                        <Select value={entryForm.teacherId} onValueChange={(v) => {
                          if (!v) { setEntryForm({ ...entryForm, teacherId: "", teacherName: "" }); return }
                          const t = teachers.find((t) => t.id === v)
                          setEntryForm({ ...entryForm, teacherId: v, teacherName: t ? `${t.firstName} ${t.lastName}` : "" })
                        }}>
                          <SelectTrigger><SelectValue placeholder="Select teacher..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">None</SelectItem>
                            {teachers.map((t: any) => (
                              <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName} {t.staffId ? `(${t.staffId})` : ""}</SelectItem>
                            ))}
                            {teachers.length === 0 && <SelectItem value="__empty" disabled>No teachers found</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEntryForm(false)}>Cancel</Button>
                  <Button onClick={saveEntry} disabled={saving} className="animated-gradient border-0 text-white">
                    <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : (editingEntry ? "Update Entry" : "Add Entry")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timetable Grid */}
      {selectedSet ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              {(() => { const cfg = TIMETABLE_TYPES.find((t) => t.value === selectedSet.type) || TIMETABLE_TYPES[0]; return <cfg.icon className="h-4 w-4" /> })()}
              {selectedSet.name}
            </h3>
            <Button size="sm" variant="outline" onClick={() => openNewEntry()}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Entry
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2.5 text-left font-semibold text-xs text-muted-foreground sticky left-0 bg-muted/50">Time</th>
                  {columns.map((col) => (
                    <th key={col} className="p-2.5 text-left font-semibold text-xs text-muted-foreground min-w-[120px]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.start} className="border-b border-border/20">
                    <td className="p-2 text-xs font-mono text-muted-foreground sticky left-0 bg-card whitespace-nowrap">
                      {slot.start} - {slot.end}
                    </td>
                    {columns.map((col) => {
                      const entriesInCell = entries.filter((e) => e.day === col && e.startTime === slot.start)
                      return (
                        <td key={col} className="p-1 align-top">
                          {entriesInCell.length > 0 ? (
                            <div className="space-y-1">
                              {entriesInCell.map((entry) => (
                                <div key={entry.id} className={`rounded-lg border px-2 py-1.5 text-xs font-medium relative group ${entry.isBreak ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : getSubjectColor(entry.subjectName || entry.subject)}`}>
                                  {entry.isBreak ? (
                                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>Break</span></div>
                                  ) : (
                                    <>
                                      <div className="font-semibold">{entry.subjectName || entry.subject}</div>
                                      {entry.room && <div className="text-[10px] opacity-70">{entry.room}</div>}
                                      {entry.teacherName && <div className="text-[10px] opacity-70">{entry.teacherName}</div>}
                                    </>
                                  )}
                                  <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                    <button onClick={(e) => { e.stopPropagation(); openEditEntry(entry) }} className="h-4 w-4 rounded bg-background/80 flex items-center justify-center hover:bg-primary/10"><Edit3 className="h-2.5 w-2.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id) }} className="h-4 w-4 rounded bg-background/80 flex items-center justify-center hover:bg-red-100"><XCircle className="h-2.5 w-2.5 text-red-500" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <button onClick={() => openNewEntry(col, slot.start)} className="w-full h-full min-h-[40px] rounded-lg border border-dashed border-border/20 text-[10px] text-muted-foreground/30 hover:border-primary/30 hover:text-primary/50 transition-colors flex items-center justify-center">
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card className="glass-card border-0"><CardContent className="p-8 text-center text-muted-foreground">Select or create a timetable set to begin editing</CardContent></Card>
      )}

      {/* Hidden export reference - off-screen so html2canvas can measure it */}
      {selectedSet && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px", visibility: "hidden" }}>
          <div ref={exportRef}>
            <TimetableExport
              set={selectedSet}
              entries={entries}
              school={school}
              classMap={classMap}
              timeSlots={TIME_SLOTS}
              days={DAYS}
            />
          </div>
        </div>
      )}
    </div>
  )
}
