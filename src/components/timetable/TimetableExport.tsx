"use client"

import { cn } from "@/lib/utils"

const TIMETABLE_TYPES = [
  { value: "regular", label: "Regular Class", icon: "CalendarDays", color: "text-blue-600" },
  { value: "exam", label: "Examination", icon: "GraduationCap", color: "text-red-600" },
  { value: "event", label: "Special Event", icon: "Palette", color: "text-violet-600" },
  { value: "holiday", label: "Holiday", icon: "Clock", color: "text-emerald-600" },
]

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Physics: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Chemistry: "bg-green-500/10 text-green-600 border-green-500/20",
  English: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  History: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}
const getSubjectColor = (sub: string) => subjectColors[sub] || "bg-primary/10 text-primary border-primary/20"

interface TimetableExportProps {
  set: any
  entries: any[]
  school: any
  classMap: Record<string, string>
  timeSlots: { start: string; end: string }[]
  days: string[]
  isExamType?: boolean
}

export function TimetableExport({ set: timetableSet, entries, school, classMap, timeSlots, days }: TimetableExportProps) {
  const isExamType = timetableSet?.type === "exam"
  const columns = isExamType ? ["Date", ...days.map((d) => d.substring(0, 3))] : days
  const schoolName = school?.name || "Access School"
  const schoolAddress = school?.address || ""
  const schoolLogo = school?.logo || ""

  const getSlot = (day: string, startTime: string) =>
    entries.filter((e) => e.day === day && e.startTime === startTime)

  return (
    <div style={{ width: "1120px", padding: "2rem", fontFamily: "Arial, sans-serif", background: "#ffffff", color: "#1a1a2e" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "3px solid #4f46e5" }}>
        {schoolLogo && (
          <img src={schoolLogo} alt="logo" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px" }} />
        )}
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#4f46e5", margin: 0 }}>{schoolName}</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0.2rem 0 0 0" }}>
            {schoolAddress && <>{schoolAddress} &mdash; </>}
            {timetableSet?.name} ({timetableSet?.type || "regular"})
            {timetableSet?.term && <> &mdash; {timetableSet.term}</>}
            {timetableSet?.session && <> &mdash; {timetableSet.session}</>}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.2rem 0 0 0" }}>
            Class: {timetableSet?.classLabel || (timetableSet?.classId ? classMap[timetableSet.classId] : "All")}
          </p>
        </div>
      </div>

      {/* Timetable Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.6rem", textAlign: "left", fontWeight: 600, background: "#4f46e5", color: "#ffffff", border: "1px solid #4338ca" }}>
              Time
            </th>
            {columns.map((col) => (
              <th key={col} style={{ padding: "0.6rem", textAlign: "left", fontWeight: 600, background: "#4f46e5", color: "#ffffff", border: "1px solid #4338ca", minWidth: "100px" }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, idx) => {
            const hasContent = columns.some((col) => getSlot(col, slot.start).length > 0)
            const slotIsBreak = columns.some((col) => getSlot(col, slot.start).some((e: any) => e.isBreak))
            return (
              <tr key={slot.start} style={{ background: idx % 2 === 0 ? "#f9fafb" : "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.5rem", fontWeight: 600, color: "#4b5563", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>
                  {slot.start} - {slot.end}
                </td>
                {columns.map((col) => {
                  const cellEntries = getSlot(col, slot.start)
                  return (
                    <td key={col} style={{ padding: "0.3rem", verticalAlign: "top", border: "1px solid #e5e7eb" }}>
                      {cellEntries.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          {cellEntries.map((entry: any) => (
                            <div key={entry.id} style={{
                              padding: "0.3rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              border: "1px solid",
                              background: entry.isBreak ? "#fef3c7" : "#eef2ff",
                              color: entry.isBreak ? "#92400e" : "#4338ca",
                              borderColor: entry.isBreak ? "#fde68a" : "#c7d2fe",
                            }}>
                              {entry.isBreak ? (
                                <span>Break</span>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 700 }}>{entry.subject}</div>
                                  {entry.room && <div style={{ fontSize: "0.65rem", opacity: 0.7 }}>{entry.room}</div>}
                                  {entry.teacherName && <div style={{ fontSize: "0.65rem", opacity: 0.7 }}>{entry.teacherName}</div>}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: "1.5rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#9ca3af" }}>
        <span>Generated by Skoolar</span>
        <span>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
      </div>
    </div>
  )
}
