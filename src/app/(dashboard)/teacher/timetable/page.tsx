"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { downloadCsv, downloadPng, downloadPdf } from "@/lib/capture"
import { FileSpreadsheet, DownloadCloud } from "lucide-react"
import { TimetableExport } from "@/components/timetable/TimetableExport"
import { toast } from "sonner"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = [{ start: "08:00", end: "08:40" }, { start: "08:40", end: "09:20" }, { start: "09:20", end: "10:00" }, { start: "10:30", end: "11:10" }, { start: "11:10", end: "11:50" }, { start: "11:50", end: "12:30" }, { start: "13:10", end: "13:50" }]
const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Physics: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Chemistry: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  English: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  History: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
}

export default function TimetablePage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [teacher, setTeacher] = useState<any>(null)
  const [sets, setSets] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSetId, setSelectedSetId] = useState("")
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] || "Monday")
  const [typeFilter, setTypeFilter] = useState("regular")
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    let staffId = ""
    fetch("/api/staff?userId=" + userId)
      .then((r) => r.json())
      .then((staffData) => {
        setTeacher(staffData)
        staffId = staffData?.id || ""
        return Promise.all([
          fetch("/api/timetable/sets").then((r) => r.json()),
          fetch("/api/classes").then((r) => r.json()),
          fetch("/api/school").then((r) => r.json()).catch(() => null),
          staffId ? fetch(`/api/timetable?teacherId=${staffId}`).then((r) => r.json()) : Promise.resolve([]),
          fetch("/api/teacher-assignments?teacherId=" + staffId).then((r) => r.json().catch(() => [])),
        ])
      })
      .then(([s, c, sch, teacherEntries, tas]) => {
        const allSets = Array.isArray(s) ? s : []
        const { classIds = [] } = tas || {}
        // Also fetch entries by classId for classes the teacher is assigned to
        const classPromises = classIds.map((cid: string) =>
          fetch(`/api/timetable?classId=${cid}`).then((r) => r.json()).catch(() => [])
        )
        return Promise.all([Promise.resolve(allSets), Promise.resolve(c), Promise.resolve(sch), Promise.resolve(Array.isArray(teacherEntries) ? teacherEntries : []), Promise.all(classPromises)])
      })
      .then(([s, c, sch, teacherEntries, classEntriesArray]) => {
        setSets(s as any[])
        setClasses(Array.isArray(c) ? c : [])
        setSchool(sch)
        // Merge teacher entries and class entries, deduplicate by id
        const merged = [...(teacherEntries as any[])]
        for (const arr of classEntriesArray as any[][]) {
          for (const entry of arr) {
            if (!merged.find((e) => e.id === entry.id)) merged.push(entry)
          }
        }
        setEntries(merged)
        const defaultSet = (s as any[]).find((set: any) => set.type === typeFilter) || (s as any[])[0]
        if (defaultSet) setSelectedSetId(defaultSet.id)
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    if (!selectedSetId) return
    fetch(`/api/timetable?setId=${selectedSetId}`).then((r) => r.json()).then((data) => setEntries(Array.isArray(data) ? data : []))
  }, [selectedSetId])

  const filteredByType = sets.filter((s) => s.type === typeFilter)
  const selectedSet = sets.find((s) => s.id === selectedSetId)
  const classMap = Object.fromEntries(classes.map((c: any) => [c.id, c.name]))

  useEffect(() => {
    if (!selectedSetId && filteredByType.length > 0) setSelectedSetId(filteredByType[0].id)
  }, [typeFilter, filteredByType.length])

  const getSlot = (day: string, startTime: string) => entries.find((t) => t.day === day && t.startTime === startTime)

  const handleTypeChange = (val: string | null) => {
    if (!val) return
    setTypeFilter(val)
    const match = sets.find((s) => s.type === val)
    if (match) setSelectedSetId(match.id)
  }

  const handleExportCSV = () => {
    const data = entries.map((e) => ({ Day: e.day, "Start": e.startTime, "End": e.endTime, Subject: e.isBreak ? "Break" : (e.subjectName || e.subject || ""), Room: e.room || "", Teacher: e.teacherName || "" }))
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

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Timetable</h2>
          <p className="text-sm text-muted-foreground">Your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!selectedSet}><FileSpreadsheet className="h-3.5 w-3.5 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PDF</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
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
        {selectedSet && <Badge variant="outline" className="text-[10px]">{selectedSet.classLabel || classMap[selectedSet.classId] || "All"}</Badge>}
      </div>

      {/* Day Pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button key={day} onClick={() => setActiveDay(day)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all", activeDay === day ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}
          >{day}</button>
        ))}
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{activeDay}</h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const entry = getSlot(activeDay, slot.start)
                return (
                  <motion.div key={slot.start} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={cn("flex items-center gap-4 rounded-xl border p-3 transition-all", entry ? "border-border/50" : "border-dashed border-border/20")}
                  >
                    <div className="w-16 text-xs font-medium text-muted-foreground">{slot.start}-{slot.end}</div>
                    <div className="h-10 w-1 rounded-full bg-muted-foreground/20" />
                    {entry ? (
                      entry.isBreak ? (
                        <div className="flex-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                          <p className="text-sm font-semibold text-amber-600">Break</p>
                        </div>
                      ) : (
                        <div className={cn("flex-1 rounded-lg border px-3 py-2", subjectColors[entry.subjectName || entry.subject] || "bg-primary/5")}>
                          <p className="text-sm font-semibold">{entry.subjectName || entry.subject}</p>
                          <p className="text-xs text-muted-foreground">{entry.room && <>Room {entry.room}</>}{entry.teacherName && <> &middot; {entry.teacherName}</>}</p>
                        </div>
                      )
                    ) : (
                      <div className="flex-1"><p className="text-sm text-muted-foreground/40 italic">Free period</p></div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Weekly Overview</h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="p-2 text-left font-medium text-muted-foreground">Time</th>
                {days.map((d) => <th key={d} className={cn("p-2 text-left font-medium text-muted-foreground", d === activeDay && "text-primary")}>{d.substring(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.start} className="border-b border-border/20">
                  <td className="p-2 text-xs text-muted-foreground">{slot.start}</td>
                  {days.map((day) => {
                    const entry = getSlot(day, slot.start)
                    return (
                      <td key={day} className={cn("p-1", day === activeDay && "bg-primary/5")}>
                        {entry ? (
                          entry.isBreak ? (
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-xs font-medium text-amber-600">Break</div>
                          ) : (
                            <div className={cn("rounded-lg px-2 py-1.5 text-xs font-medium", subjectColors[entry.subjectName || entry.subject] || "bg-primary/10 text-primary")}>
                              {entry.subjectName || entry.subject}
                              <div className="text-[10px] opacity-70">{entry.room && <>Rm {entry.room}</>}</div>
                            </div>
                          )
                        ) : <span className="text-xs text-muted-foreground/30">&mdash;</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden export ref */}
      {selectedSet && <div className="hidden"><div ref={exportRef}><TimetableExport set={selectedSet} entries={entries} school={school} classMap={classMap} timeSlots={timeSlots} days={days} /></div></div>}
    </div>
  )
}
