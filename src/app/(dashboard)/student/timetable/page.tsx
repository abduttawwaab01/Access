"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock, MapPin } from "lucide-react"
import { FileSpreadsheet, DownloadCloud } from "lucide-react"
import { downloadCsv, downloadPng, downloadPdf } from "@/lib/capture"
import { TimetableExport } from "@/components/timetable/TimetableExport"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = [{ start: "08:00", end: "08:40" }, { start: "08:40", end: "09:20" }, { start: "09:20", end: "10:00" }, { start: "10:30", end: "11:10" }, { start: "11:10", end: "11:50" }, { start: "11:50", end: "12:30" }, { start: "13:10", end: "13:50" }]

export default function StudentTimetablePage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [sets, setSets] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [studentClassId, setStudentClassId] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedSetId, setSelectedSetId] = useState("")
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [typeFilter, setTypeFilter] = useState("regular")
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      fetch("/api/timetable/sets").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()).catch(() => null),
      fetch(`/api/students?userId=${userId}`).then((r) => r.json()).catch(() => null),
    ]).then(([s, sch, student]) => {
      const allSets = Array.isArray(s) ? s : []
      setSets(allSets)
      setSchool(sch)
      setStudentClassId(student?.classId || "")
      const defaultSet = allSets.find((set: any) => set.type === typeFilter) || allSets[0]
      if (defaultSet) setSelectedSetId(defaultSet.id)
      setLoading(false)
    })
  }, [userId])

  useEffect(() => {
    if (!selectedSetId) return
    fetch(`/api/timetable?setId=${selectedSetId}`).then((r) => r.json()).then((data) => {
      const all = Array.isArray(data) ? data : []
      setEntries(studentClassId ? all.filter((e: any) => e.classId === studentClassId) : all)
    })
  }, [selectedSetId, studentClassId])

  const filteredByType = sets.filter((s) => s.type === typeFilter)
  const selectedSet = sets.find((s) => s.id === selectedSetId)

  useEffect(() => {
    if (!selectedSetId && filteredByType.length > 0) setSelectedSetId(filteredByType[0].id)
  }, [typeFilter, filteredByType.length])

  const daySlots = entries.filter((t) => t.day === selectedDay)

  const handleTypeChange = (val: string | null) => {
    if (!val) return
    setTypeFilter(val)
    const match = sets.find((s) => s.type === val)
    if (match) setSelectedSetId(match.id)
  }

  const handleExportCSV = () => {
    const data = entries.map((e) => ({ Day: e.day, Start: e.startTime, End: e.endTime, Subject: e.isBreak ? "Break" : (e.subjectName || e.subject), Room: e.room || "", Teacher: e.teacherName || "" }))
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

  if (loading) return <div className="p-4 md:p-6"><div className="h-48 md:h-64 min-h-[180px] rounded-xl bg-muted animate-pulse" /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Timetable</h2>
        <p className="text-sm text-muted-foreground">Weekly class schedule</p>
      </motion.div>

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
        <div className="flex gap-1.5 ml-auto">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!selectedSet}><FileSpreadsheet className="h-3.5 w-3.5 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PNG</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!selectedSet}><DownloadCloud className="h-3.5 w-3.5 mr-1" />PDF</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {days.map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`shrink-0 px-4 py-3 rounded-full text-sm font-medium transition-all min-h-[44px] snap-start ${selectedDay === day ? "animated-gradient text-white shadow-lg" : "bg-muted hover:bg-muted/80"}`}
          >{day}</button>
        ))}
      </div>

      <motion.div key={selectedDay} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        {timeSlots.map((slot) => {
          const entry = daySlots.find((s) => s.startTime === slot.start)
          return (
            <Card key={slot.start} className={`glass-card border-0 ${entry ? "" : "opacity-40"}`}>
              <CardContent className="p-4">
                {entry ? (
                  entry.isBreak ? (
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-amber-600">Break</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{slot.start} - {slot.end}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{entry.subjectName || entry.subject}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{slot.start} - {slot.end}</span>
                          {entry.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{entry.room}</span>}
                          {entry.teacherName && <span className="flex items-center gap-1">{entry.teacherName}</span>}
                        </div>
                      </div>
                      {entry.room && <Badge variant="outline">{entry.room}</Badge>}
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <p className="text-sm text-muted-foreground">Free Period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {selectedSet && <div className="hidden"><div ref={exportRef}><TimetableExport set={selectedSet} entries={entries} school={school} classMap={{}} timeSlots={timeSlots} days={days} /></div></div>}
    </div>
  )
}
