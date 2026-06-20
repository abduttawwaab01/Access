"use client"

import { forwardRef } from "react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts"

interface SubjectResult {
  subject: string
  score: number
  total: number
  grade: string
  remark: string
}

interface Domain {
  name: string
  score: number
  max: number
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  total: number
}

interface ReportCardData {
  schoolName: string
  schoolLogo?: string
  schoolMotto?: string
  schoolAddress?: string
  studentName: string
  studentId: string
  className: string
  term: string
  session: string
  subjects: SubjectResult[]
  domains: Domain[]
  attendance: AttendanceSummary
  teacherComment: string
  teacherName?: string
  principalComment: string
  nextTerm?: string
  position?: string
  totalStudents?: number
  generatedAt?: string
}

const GRADE_COLORS: Record<string, string> = {
  A: "#22c55e", B: "#3b82f6", C: "#f59e0b", D: "#f97316", E: "#ef4444", F: "#dc2626",
}

const GRADE_BG: Record<string, string> = {
  A: "bg-green-500/15 text-green-600",
  B: "bg-blue-500/15 text-blue-600",
  C: "bg-amber-500/15 text-amber-600",
  D: "bg-orange-500/15 text-orange-600",
  E: "bg-red-500/15 text-red-600",
  F: "bg-red-500/15 text-red-600",
}

function getGrade(pct: number) {
  if (pct >= 75) return { grade: "A", remark: "Excellent" }
  if (pct >= 65) return { grade: "B", remark: "Very Good" }
  if (pct >= 55) return { grade: "C", remark: "Good" }
  if (pct >= 45) return { grade: "D", remark: "Fair" }
  if (pct >= 40) return { grade: "E", remark: "Pass" }
  return { grade: "F", remark: "Fail" }
}

export const ReportCard = forwardRef<HTMLDivElement, { data: ReportCardData }>(({ data }, ref) => {
  const totals = data.subjects.reduce((s, r) => s + r.score, 0)
  const maxTotal = data.subjects.reduce((s, r) => s + r.total, 0)
  const average = maxTotal > 0 ? Math.round((totals / maxTotal) * 100) : 0
  const letterGrade = getGrade(average)

  const radarData = data.subjects.map((r) => {
    const pct = Math.round((r.score / r.total) * 100)
    return { subject: r.subject.length > 8 ? r.subject.substring(0, 7) + "..." : r.subject, score: pct, fullMark: 100 }
  })

  const barData = data.subjects.map((r) => {
    const pct = Math.round((r.score / r.total) * 100)
    return { subject: r.subject, score: pct, grade: r.grade }
  })

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-xl overflow-hidden border print:shadow-none print:border print:rounded-none" style={{ width: "210mm", minHeight: "297mm" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white text-center relative overflow-hidden print:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            {data.schoolLogo ? (
              <img src={data.schoolLogo} alt="" className="h-16 w-16 rounded-full border-2 border-white/30 object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">S</div>
            )}
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight">{data.schoolName}</h1>
              {data.schoolMotto && <p className="text-xs opacity-80 italic">&ldquo;{data.schoolMotto}&rdquo;</p>}
            </div>
          </div>
          <div className="h-px bg-white/20 my-3" />
          <p className="text-lg font-semibold tracking-wider">ACADEMIC REPORT CARD</p>
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="opacity-70 text-[10px] uppercase tracking-wider">Student</p>
              <p className="font-bold text-base">{data.studentName}</p>
            </div>
            <div className="text-center">
              <p className="opacity-70 text-[10px] uppercase tracking-wider">Class</p>
              <p className="font-semibold">{data.className}</p>
            </div>
            <div className="text-center">
              <p className="opacity-70 text-[10px] uppercase tracking-wider">Term</p>
              <p className="font-semibold">{data.term}</p>
            </div>
            <div className="text-center">
              <p className="opacity-70 text-[10px] uppercase tracking-wider">Session</p>
              <p className="font-semibold">{data.session}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6 print:p-6 print:space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-center gap-8 print:gap-6">
          <div className="text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg print:h-24 print:w-24">
              <div>
                <p className="text-3xl font-bold print:text-2xl">{average}%</p>
                <p className="text-[10px] opacity-80">Average</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className={`flex h-28 w-28 items-center justify-center rounded-full shadow-lg print:h-24 print:w-24 ${
              letterGrade.grade === "A" ? "bg-gradient-to-br from-green-400 to-emerald-600" :
              letterGrade.grade === "B" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
              letterGrade.grade === "C" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
              "bg-gradient-to-br from-red-400 to-red-600"
            } text-white`}>
              <div>
                <p className="text-3xl font-bold print:text-2xl">{letterGrade.grade}</p>
                <p className="text-[10px] opacity-80">Grade</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-600">{data.position || "—"}</p>
            <p className="text-xs text-muted-foreground">Position</p>
            {data.totalStudents && <p className="text-[10px] text-muted-foreground">of {data.totalStudents}</p>}
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {letterGrade.remark}
            </div>
          </div>
        </div>

        {/* Subject Scores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
            <h3 className="font-bold text-sm text-indigo-800 uppercase tracking-wider">Subject Performance</h3>
            <div className="h-0.5 flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
          </div>
          <div className="space-y-2">
            {data.subjects.map((r) => {
              const pct = Math.round((r.score / r.total) * 100)
              const color = pct >= 75 ? "bg-green-500" : pct >= 65 ? "bg-blue-500" : pct >= 55 ? "bg-amber-500" : pct >= 45 ? "bg-orange-500" : "bg-red-500"
              return (
                <div key={r.subject} className="print:text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium print:text-xs">{r.subject}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${GRADE_BG[r.grade] || "bg-gray-500/15 text-gray-600"}`}>{r.grade}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono print:text-xs">{r.score}/{r.total}</span>
                      <span className="text-xs text-muted-foreground w-20 text-right print:text-[10px]">{r.remark}</span>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden print:h-2">
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
              <h3 className="font-bold text-xs text-indigo-800 uppercase tracking-wider">Performance Radar</h3>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
            </div>
            <div className="h-52 print:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
              <h3 className="font-bold text-xs text-indigo-800 uppercase tracking-wider">Score Distribution</h3>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
            </div>
            <div className="h-52 print:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <XAxis dataKey="subject" tick={{ fontSize: 8, fill: "#6b7280" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: "#6b7280" }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: any) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={GRADE_COLORS[entry.grade] || "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Domains */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
            <h3 className="font-bold text-xs text-indigo-800 uppercase tracking-wider">Affective &amp; Psychomotor Domains</h3>
            <div className="h-0.5 flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:gap-2">
            {data.domains.map((d) => {
              const pct = Math.round((d.score / d.max) * 100)
              return (
                <div key={d.name} className="rounded-xl bg-gray-50 border border-gray-100 p-3 print:p-2">
                  <p className="text-xs font-medium text-gray-700 mb-1.5 print:text-[10px]">{d.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden print:h-1.5">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-gray-500 print:text-[10px]">{d.score}/{d.max}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Attendance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
            <h3 className="font-bold text-xs text-indigo-800 uppercase tracking-wider">Attendance Summary</h3>
            <div className="h-0.5 flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
          </div>
          <div className="grid grid-cols-4 gap-3 text-center print:gap-2">
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 print:p-2">
              <p className="text-xl font-bold text-green-600 print:text-lg">{data.attendance.present}</p>
              <p className="text-[10px] text-green-700">Present</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 print:p-2">
              <p className="text-xl font-bold text-red-600 print:text-lg">{data.attendance.absent}</p>
              <p className="text-[10px] text-red-700">Absent</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 print:p-2">
              <p className="text-xl font-bold text-amber-600 print:text-lg">{data.attendance.late}</p>
              <p className="text-[10px] text-amber-700">Late</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 print:p-2">
              <p className="text-xl font-bold text-blue-600 print:text-lg">{Math.round(data.attendance.present / (data.attendance.total || 1) * 100)}%</p>
              <p className="text-[10px] text-blue-700">Rate</p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4 print:p-3">
            <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mb-2">Teacher&apos;s Comment</p>
            <p className="text-sm italic text-gray-700 print:text-xs">{data.teacherComment}</p>
            {data.teacherName && <p className="text-xs text-indigo-600 mt-2 font-medium">— {data.teacherName}</p>}
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4 print:p-3">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">Principal&apos;s Comment</p>
            <p className="text-sm italic text-gray-700 print:text-xs">{data.principalComment}</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">— Principal</p>
          </div>
        </div>

        {/* Footer */}
        <div className="rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-100 p-4 text-center print:p-2">
          <p className="text-xs text-gray-500 print:text-[10px]">
            Next Term Begins: <strong>{data.nextTerm || "TBA"}</strong>
            {data.generatedAt && (
              <> &nbsp;|&nbsp; Generated: <strong>{new Date(data.generatedAt).toLocaleDateString()}</strong></>
            )}
          </p>
          <p className="text-[9px] text-gray-400 mt-1 print:hidden">This is a computer-generated document</p>
        </div>
      </div>
    </div>
  )
})

ReportCard.displayName = "ReportCard"
