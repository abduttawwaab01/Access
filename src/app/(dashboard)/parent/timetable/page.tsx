"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useParentChildren } from "@/hooks/useParentChildren"
import { downloadCsv, downloadPng, downloadPdf } from "@/lib/capture"
import { TimetableExport } from "@/components/timetable/TimetableExport"
import { FileSpreadsheet, DownloadCloud } from "lucide-react"
import { toast } from "sonner"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = [{ start: "08:00", end: "08:40" }, { start: "08:40", end: "09:20" }, { start: "09:20", end: "10:00" }, { start: "10:30", end: "11:10" }, { start: "11:10", end: "11:50" }, { start: "11:50", end: "12:30" }, { start: "13:10", end: "13:50" }]

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Physics: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Chemistry: "bg-green-500/10 text-green-600 border-green-500/20",
  "English Language": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  History: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

export default function ParentTimetablePage() {
  const { children, activeChild, activeChildId, setActiveChildId, loading: childrenLoading } = useParentChildren()
  const [sets, setSets] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSetId, setSelectedSetId] = useState("")
  const [typeFilter, setTypeFilter] = useState("regular")
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/timetable/sets").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()).catch(() => null),
    ]).then(([s, sch]) => {
      const allSets = Array.isArray(s) ? s : []
      setSets(allSets)
      setSchool(sch)
      const defaultSet = allSets.find((set: any) => set.type === typeFilter) || allSets[0]
      if (defaultSet) setSelectedSetId(defaultSet.id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedSetId) return
    fetch(`/api/timetable?setId=${selectedSetId}`).then((r) => r.json()).then((data) => setEntries(Array.isArray(data) ? data : []))
  }, [selectedSetId])

  const filteredByType = sets.filter((s) => s.type === typeFilter)
  const selectedSet = sets.find((s) => s.id === selectedSetId)

  useEffect(() => {
    if (!selectedSetId && filteredByType.length > 0) setSelectedSetId(filteredByType[0].id)
  }, [typeFilter, filteredByType.length])

  const filteredTimetable = activeChild
    ? entries.filter((t) => t.classId === activeChild.classId)
    : entries

  const getSlot = (day: string, startTime: string) => filteredTimetable.find((t) => t.day === day && t.startTime === startTime)

  const handleTypeChange = (val: string | null) => {
    if (!val) return
    setTypeFilter(val)
    const match = sets.find((s) => s.type === val)
    if (match) setSelectedSetId(match.id)
  }

  const handleExportCSV = () => {
    const data = filteredTimetable.map((e) => ({ Day: e.day, Start: e.startTime, End: e.endTime, Subject: e.isBreak ? "Break" : (e.subjectName || e.subject), Room: e.room || "", Teacher: e.teacherName || "" }))
    downloadCsv(data, `${selectedSet?.name || "Timetable"}.csv`)
    toast.success("CSV exported")
  }

  const handleExportPNG = async () => {
    if (!exportRef.current) return
    try { await downloadPng(exportRef.current, `${selectedSet?.name || "Timetable"}.png`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("PNG exported") }
    catch { toast.error("Export failed") }
  }

  const handleExportPDF = async () => {
    if (!exportRef.current) return
    try { await downloadPdf(exportRef.current, `${selectedSet?.name || "Timetable"}.pdf`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("PDF exported") }
    catch { toast.error("Export failed") }
  }

  if (childrenLoading) {
    return (
      <div className="p-4 md:p-6 space-y-5">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="flex gap-2">{[1, 2].map((i) => <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse" />)}</div>
        <div className="h-48 md:h-64 min-h-[180px] rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!activeChildId) return null

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Class Timetable</h2>
          <p className="text-sm text-muted-foreground">View weekly class schedule</p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!selectedSet}><FileSpreadsheet className="h-3.5 w-3.5 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PDF</Button>
        </div>
      </div>

      {/* Child selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {children.map((c) => (
          <button key={c.id} onClick={() => setActiveChildId(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all snap-start ${activeChildId === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >{c.name.split(" ")[0]}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={typeFilter} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular Class</SelectItem>
            <SelectItem value="exam">Examination</SelectItem>
            <SelectItem value="event">Special Event</SelectItem>
            <SelectItem value="holiday">Holiday</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedSetId} onValueChange={(v) => { if (v) setSelectedSetId(v) }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select set" /></SelectTrigger>
          <SelectContent>
            {filteredByType.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSet && <Badge variant="outline" className="text-[10px]">{selectedSet.classLabel}</Badge>}
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-3 text-left font-medium text-muted-foreground text-xs sticky left-0 bg-card">Time</th>
                {days.map((d) => <th key={d} className="p-3 text-left font-medium text-xs min-w-[100px]">{d.substring(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : (
                timeSlots.map((slot) => (
                  <tr key={slot.start} className="border-b border-border/20">
                    <td className="p-3 text-xs text-muted-foreground font-medium sticky left-0 bg-card">{slot.start}-{slot.end}</td>
                    {days.map((day) => {
                      const entry = getSlot(day, slot.start)
                      return (
                        <td key={day} className="p-1.5">
                          {entry ? (
                            entry.isBreak ? (
                              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-xs font-medium text-amber-600">Break</div>
                            ) : (
                              <div className={cn("rounded-lg px-2 py-1.5 text-xs font-medium border", subjectColors[entry.subjectName || entry.subject] || "bg-primary/10 text-primary border-primary/20")}>
                                {entry.subjectName || entry.subject}
                                <div className="text-[10px] opacity-70">Rm {entry.room}</div>
                              </div>
                            )
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selectedSet && <div className="hidden"><div ref={exportRef}><TimetableExport set={selectedSet} entries={filteredTimetable} school={school} classMap={{}} timeSlots={timeSlots} days={days} /></div></div>}
    </div>
  )
}
