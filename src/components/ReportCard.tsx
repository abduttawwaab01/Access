"use client"

import { forwardRef, useMemo } from "react"
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
  schoolPhone?: string
  schoolEmail?: string
  studentName: string
  studentId: string
  studentPhoto?: string
  studentGender?: string
  studentDOB?: string
  className: string
  classSection?: string
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
  const subjectCount = data.subjects.length
  const compact = subjectCount > 8

  const radarData = data.subjects.map((r) => {
    const pct = Math.round((r.score / r.total) * 100)
    return { subject: r.subject.length > 8 ? r.subject.substring(0, 7) + "..." : r.subject, score: pct, fullMark: 100 }
  })

  const barData = data.subjects.map((r) => {
    const pct = Math.round((r.score / r.total) * 100)
    return { subject: r.subject, score: pct, grade: r.grade }
  })

  const chartHeight = compact ? 140 : 180

  const totalPercentage = maxTotal > 0 ? Math.round((totals / maxTotal) * 100) : 0

  return (
    <div
      ref={ref}
      className="bg-white shadow-xl overflow-hidden border font-[family-name:var(--font-geist-sans),var(--font-arabic)]"
      style={{ width: "210mm", minHeight: "297mm", fontSize: compact ? "6.5pt" : "7.5pt" }}
    >
      {/* ── Header Strip ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10 flex items-start gap-4 p-4" style={{ padding: compact ? "10pt 14pt" : "14pt 18pt" }}>
          {/* School Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {data.schoolLogo ? (
              <img src={data.schoolLogo} alt="" className="rounded-full border-2 border-white/30 object-cover" style={{ width: compact ? "36pt" : "48pt", height: compact ? "36pt" : "48pt" }} />
            ) : (
              <div className="rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0" style={{ width: compact ? "36pt" : "48pt", height: compact ? "36pt" : "48pt", fontSize: compact ? "12pt" : "16pt" }}>
                {data.schoolName?.[0] || "S"}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold leading-tight" style={{ fontSize: compact ? "10pt" : "13pt" }}>{data.schoolName}</h1>
              {data.schoolMotto && <p className="opacity-80 italic" style={{ fontSize: "6.5pt" }}>&ldquo;{data.schoolMotto}&rdquo;</p>}
              {data.schoolAddress && <p className="opacity-70" style={{ fontSize: "6pt" }}>{data.schoolAddress}</p>}
              <div className="flex gap-3 opacity-70" style={{ fontSize: "5.5pt" }}>
                {data.schoolPhone && <span>{data.schoolPhone}</span>}
                {data.schoolEmail && <span>{data.schoolEmail}</span>}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-bold" style={{ fontSize: compact ? "9pt" : "11pt" }}>{data.studentName}</p>
              <p style={{ fontSize: "6.5pt", opacity: 0.8 }}>{data.className} {data.classSection ? `• ${data.classSection}` : ""}</p>
              <p style={{ fontSize: "6pt", opacity: 0.7 }}>ID: {data.studentId}</p>
              {data.studentGender && <p style={{ fontSize: "5.5pt", opacity: 0.6 }}>{data.studentGender}{data.studentDOB ? ` | ${data.studentDOB}` : ""}</p>}
              <div style={{ fontSize: "6pt", opacity: 0.8, marginTop: "2pt" }}>
                <span className="font-semibold">{data.term}</span> | <span>{data.session}</span>
              </div>
            </div>
            {data.studentPhoto ? (
              <img src={data.studentPhoto} alt="" className="rounded-xl border-2 border-white/30 object-cover shrink-0" style={{ width: compact ? "40pt" : "52pt", height: compact ? "40pt" : "52pt" }} />
            ) : (
              <div className="rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0" style={{ width: compact ? "40pt" : "52pt", height: compact ? "40pt" : "52pt", fontSize: compact ? "12pt" : "16pt" }}>
                {data.studentName?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "ST"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: compact ? "8pt 14pt" : "12pt 18pt" }}>
        {/* === SUBJECT TABLE === */}
        <div className="mb-2" style={{ marginBottom: compact ? "4pt" : "8pt" }}>
          <h3 className="font-bold uppercase tracking-wider text-indigo-800" style={{ fontSize: "7.5pt", marginBottom: "3pt" }}>Academic Performance</h3>
          <table className="w-full border-collapse" style={{ fontSize: compact ? "5.5pt" : "6.5pt" }}>
            <thead>
              <tr className="bg-indigo-50 text-left">
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700" style={{ width: "4%" }}>#</th>
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700">Subject</th>
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700 text-center" style={{ width: "10%" }}>Score</th>
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700 text-center" style={{ width: "10%" }}>Total</th>
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700 text-center" style={{ width: "10%" }}>%</th>
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700 text-center" style={{ width: "8%" }}>Grade</th>
                <th className="border border-gray-200 px-1.5 py-1 font-semibold text-indigo-700">Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((r, i) => {
                const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0
                return (
                  <tr key={r.subject} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="border border-gray-200 px-1.5 py-1 text-center text-muted-foreground">{i + 1}</td>
                    <td className="border border-gray-200 px-1.5 py-1 font-medium">{r.subject}</td>
                    <td className="border border-gray-200 px-1.5 py-1 text-center font-mono">{r.score}</td>
                    <td className="border border-gray-200 px-1.5 py-1 text-center font-mono">{r.total}</td>
                    <td className="border border-gray-200 px-1.5 py-1 text-center font-mono">{pct}%</td>
                    <td className="border border-gray-200 px-1.5 py-1 text-center">
                      <span className="inline-block font-bold px-1.5 py-0.5 rounded" style={{
                        color: GRADE_COLORS[r.grade] || "#6b7280",
                        backgroundColor: `${GRADE_COLORS[r.grade] || "#6b7280"}15`,
                        fontSize: compact ? "5pt" : "6pt",
                      }}>{r.grade}</span>
                    </td>
                    <td className="border border-gray-200 px-1.5 py-1 text-muted-foreground" style={{ fontSize: compact ? "5pt" : "6pt" }}>{r.remark}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-1" style={{ marginTop: "3pt" }}>
            <p className="text-muted-foreground" style={{ fontSize: "5.5pt" }}>Total Subjects: {subjectCount}</p>
            <p className="font-semibold text-indigo-700" style={{ fontSize: "6.5pt" }}>
              Aggregate: {totals}/{maxTotal} ({totalPercentage}%) &mdash; {letterGrade.remark}
            </p>
          </div>
        </div>

        {/* === CHARTS ROW === */}
        <div className="grid grid-cols-2 gap-3 print:gap-2" style={{ marginBottom: compact ? "4pt" : "8pt" }}>
          <div>
            <h3 className="font-bold uppercase tracking-wider text-indigo-800" style={{ fontSize: "6.5pt", marginBottom: "2pt" }}>Performance Radar</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: compact ? 6 : 7, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-wider text-indigo-800" style={{ fontSize: "6.5pt", marginBottom: "2pt" }}>Score Distribution</h3>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 2, right: 2, bottom: 2, left: -10 }}>
                  <XAxis dataKey="subject" tick={{ fontSize: compact ? 5.5 : 6.5, fill: "#6b7280" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: compact ? 5.5 : 6.5, fill: "#6b7280" }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} formatter={(value: any) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={GRADE_COLORS[entry.grade] || "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* === AFFECTIVE DOMAINS === */}
        <div className="mb-2" style={{ marginBottom: compact ? "4pt" : "8pt" }}>
          <h3 className="font-bold uppercase tracking-wider text-indigo-800" style={{ fontSize: "6.5pt", marginBottom: "3pt" }}>Affective &amp; Psychomotor Domains</h3>
          <div className="grid grid-cols-3 gap-2 print:gap-1.5">
            {data.domains.map((d) => {
              const pct = Math.round((d.score / d.max) * 100)
              return (
                <div key={d.name} className="rounded bg-gray-50 border border-gray-100" style={{ padding: compact ? "3pt 5pt" : "4pt 8pt" }}>
                  <p className="font-medium text-gray-700" style={{ fontSize: compact ? "5.5pt" : "6.5pt" }}>{d.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-gray-200 rounded-full overflow-hidden" style={{ height: compact ? "4pt" : "6pt" }}>
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-gray-500" style={{ fontSize: compact ? "5pt" : "6pt" }}>{d.score}/{d.max}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* === ATTENDANCE + GRADE CIRCLE ROW === */}
        <div className="grid grid-cols-3 gap-3 print:gap-2" style={{ marginBottom: compact ? "4pt" : "8pt" }}>
          <div className="col-span-2">
            <h3 className="font-bold uppercase tracking-wider text-indigo-800" style={{ fontSize: "6.5pt", marginBottom: "3pt" }}>Attendance Summary</h3>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="rounded bg-green-50 border border-green-100" style={{ padding: compact ? "3pt" : "5pt" }}>
                <p className="font-bold text-green-600" style={{ fontSize: compact ? "8pt" : "10pt" }}>{data.attendance.present}</p>
                <p className="text-green-700" style={{ fontSize: compact ? "4.5pt" : "5.5pt" }}>Present</p>
              </div>
              <div className="rounded bg-red-50 border border-red-100" style={{ padding: compact ? "3pt" : "5pt" }}>
                <p className="font-bold text-red-600" style={{ fontSize: compact ? "8pt" : "10pt" }}>{data.attendance.absent}</p>
                <p className="text-red-700" style={{ fontSize: compact ? "4.5pt" : "5.5pt" }}>Absent</p>
              </div>
              <div className="rounded bg-amber-50 border border-amber-100" style={{ padding: compact ? "3pt" : "5pt" }}>
                <p className="font-bold text-amber-600" style={{ fontSize: compact ? "8pt" : "10pt" }}>{data.attendance.late}</p>
                <p className="text-amber-700" style={{ fontSize: compact ? "4.5pt" : "5.5pt" }}>Late</p>
              </div>
              <div className="rounded bg-blue-50 border border-blue-100" style={{ padding: compact ? "3pt" : "5pt" }}>
                <p className="font-bold text-blue-600" style={{ fontSize: compact ? "8pt" : "10pt" }}>{Math.round((data.attendance.present / (data.attendance.total || 1)) * 100)}%</p>
                <p className="text-blue-700" style={{ fontSize: compact ? "4.5pt" : "5.5pt" }}>Rate</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="font-bold uppercase tracking-wider text-indigo-800" style={{ fontSize: "6pt" }}>Overall</p>
            <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow" style={{ width: compact ? "40pt" : "52pt", height: compact ? "40pt" : "52pt" }}>
              <div className="text-center">
                <p className="font-bold leading-none" style={{ fontSize: compact ? "11pt" : "15pt" }}>{totalPercentage}%</p>
                <p style={{ fontSize: "5pt", opacity: 0.8 }}>Avg</p>
              </div>
            </div>
            <p className="font-bold" style={{ fontSize: compact ? "7pt" : "9pt", color: GRADE_COLORS[letterGrade.grade] || "#6b7280" }}>{letterGrade.grade} &mdash; {letterGrade.remark}</p>
          </div>
        </div>

        {/* === COMMENTS === */}
        <div className="grid grid-cols-2 gap-3 print:gap-2" style={{ marginBottom: "4pt" }}>
          <div className="rounded bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100" style={{ padding: compact ? "4pt 8pt" : "6pt 10pt" }}>
            <p className="font-semibold text-indigo-700 uppercase tracking-wider" style={{ fontSize: "6pt", marginBottom: "2pt" }}>Teacher&apos;s Comment</p>
            <p className="italic text-gray-700" style={{ fontSize: compact ? "5.5pt" : "6.5pt" }}>{data.teacherComment}</p>
            {data.teacherName && <p className="text-indigo-600 font-medium mt-1" style={{ fontSize: "6pt" }}>&mdash; {data.teacherName}</p>}
          </div>
          <div className="rounded bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100" style={{ padding: compact ? "4pt 8pt" : "6pt 10pt" }}>
            <p className="font-semibold text-amber-700 uppercase tracking-wider" style={{ fontSize: "6pt", marginBottom: "2pt" }}>Principal&apos;s Comment</p>
            <p className="italic text-gray-700" style={{ fontSize: compact ? "5.5pt" : "6.5pt" }}>{data.principalComment}</p>
            <p className="text-amber-600 font-medium mt-1" style={{ fontSize: "6pt" }}>&mdash; Principal</p>
          </div>
        </div>

        {/* === KEY (Position / Total) === */}
        <div className="flex items-center justify-between border-t border-gray-200" style={{ paddingTop: "3pt", fontSize: "5.5pt" }}>
          <div className="flex gap-4 text-muted-foreground">
            {data.position && <span>Position: <strong className="text-gray-700">{data.position}</strong>{data.totalStudents ? ` of ${data.totalStudents}` : ""}</span>}
            {data.nextTerm && <span>Next Term: <strong className="text-gray-700">{data.nextTerm}</strong></span>}
          </div>
          <div className="text-muted-foreground">
            {data.generatedAt && <>Generated: {new Date(data.generatedAt).toLocaleDateString()}</>}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-gray-400" style={{ fontSize: "4.5pt", marginTop: "2pt" }}>
          This is a computer-generated document &bull; Access School Management Platform
        </div>
      </div>
    </div>
  )
})

ReportCard.displayName = "ReportCard"