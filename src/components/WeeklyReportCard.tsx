"use client"

import { forwardRef } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface SubjectPerformance {
  subject: string
  subjectId: string
  score: number
  assignmentsCompleted: number
  assignmentsTotal: number
  participation: number
  notes?: string
}

interface BehaviorData {
  punctuality: number
  attentiveness: number
  conduct: number
  homeworkCompletion: number
  teamwork: number
  behaviorNotes: string
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  total: number
}

interface WeeklyReportData {
  schoolName?: string
  schoolLogo?: string
  schoolMotto?: string
  schoolAddress?: string
  studentName: string
  studentId: string
  className: string
  term: string
  session: string
  week: number
  subjectPerformances: SubjectPerformance[]
  behavior: BehaviorData
  attendance: AttendanceSummary
  teacherComment: string
  teacherName?: string
  overallRating: number
  generatedAt?: string
}

const RATING_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"]
const RATING_LABELS = ["Poor", "Below Avg", "Average", "Good", "Excellent"]

function BehaviorBar({ label, value }: { label: string; value: number }) {
  const color = RATING_COLORS[Math.max(0, Math.min(value - 1, 4))]
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[11px] mb-0.5">
        <span className="font-medium">{label}</span>
        <span style={{ color }}>{RATING_LABELS[Math.max(0, Math.min(value - 1, 4))]}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / 5) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const WeeklyReportCard = forwardRef<HTMLDivElement, { data: WeeklyReportData }>(({ data }, ref) => {
  const chartData = data.subjectPerformances.map((s) => ({
    subject: s.subject.length > 10 ? s.subject.slice(0, 10) + "…" : s.subject,
    score: s.score,
    fill: s.score >= 70 ? "#22c55e" : s.score >= 50 ? "#eab308" : "#ef4444",
  }))

  return (
    <div
      ref={ref}
      className="bg-white text-black rounded-2xl overflow-hidden shadow-xl mx-auto"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white text-center">
        {data.schoolLogo && <img src={data.schoolLogo} alt="School" className="h-14 w-14 mx-auto mb-2 rounded-full object-cover border-2 border-white/30" />}
        <h1 className="text-xl font-bold tracking-tight">{data.schoolName || "Access School"}</h1>
        {data.schoolMotto && <p className="text-[11px] opacity-80 mt-0.5">{data.schoolMotto}</p>}
        {data.schoolAddress && <p className="text-[10px] opacity-70 mt-0.5">{data.schoolAddress}</p>}
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide text-center">Weekly Report — Week {data.week}</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-[12px]">
          <div><span className="text-gray-500">Student:</span> <span className="font-semibold">{data.studentName}</span></div>
          <div><span className="text-gray-500">Student ID:</span> <span className="font-semibold">{data.studentId}</span></div>
          <div><span className="text-gray-500">Class:</span> <span className="font-semibold">{data.className}</span></div>
          <div><span className="text-gray-500">Term:</span> <span className="font-semibold">{data.term}</span></div>
          <div><span className="text-gray-500">Session:</span> <span className="font-semibold">{data.session}</span></div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-gray-700 uppercase">Overall Rating</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-lg" style={{ color: star <= data.overallRating ? "#eab308" : "#d1d5db" }}>★</span>
            ))}
          </div>
        </div>
      </div>

      {data.subjectPerformances.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-[13px] font-bold text-gray-700 uppercase mb-3">Subject Performance</h3>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 font-semibold text-gray-600">Subject</th>
                <th className="text-center py-1.5 font-semibold text-gray-600">Score</th>
                <th className="text-center py-1.5 font-semibold text-gray-600">Assignments</th>
                <th className="text-center py-1.5 font-semibold text-gray-600">Participation</th>
              </tr>
            </thead>
            <tbody>
              {data.subjectPerformances.map((s, i) => (
                <tr key={s.subjectId} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="py-1.5 font-medium">{s.subject}</td>
                  <td className="text-center py-1.5">
                    <span className={`font-bold ${s.score >= 70 ? "text-green-600" : s.score >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {s.score}%
                    </span>
                  </td>
                  <td className="text-center py-1.5 text-gray-600">
                    {s.assignmentsCompleted}/{s.assignmentsTotal}
                  </td>
                  <td className="text-center py-1.5">{s.participation}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-28 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="subject" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 8 }} width={20} axisLine={false} tickLine={false} />
                <Bar dataKey="score" radius={[3, 3, 0, 0]} maxBarSize={20}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-[13px] font-bold text-gray-700 uppercase mb-2">Behavioral Assessment</h3>
        <BehaviorBar label="Punctuality" value={data.behavior.punctuality} />
        <BehaviorBar label="Attentiveness" value={data.behavior.attentiveness} />
        <BehaviorBar label="Conduct" value={data.behavior.conduct} />
        <BehaviorBar label="Homework Completion" value={data.behavior.homeworkCompletion} />
        <BehaviorBar label="Teamwork" value={data.behavior.teamwork} />
        {data.behavior.behaviorNotes && (
          <p className="text-[11px] text-gray-600 italic mt-2">Note: {data.behavior.behaviorNotes}</p>
        )}
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-[13px] font-bold text-gray-700 uppercase mb-2">Attendance (This Week)</h3>
        <div className="flex gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Present: <strong>{data.attendance.present}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Absent: <strong>{data.attendance.absent}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Late: <strong>{data.attendance.late}</strong></span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${data.attendance.total > 0 ? (data.attendance.present / data.attendance.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-[13px] font-bold text-gray-700 uppercase mb-1">Teacher&apos;s Comment</h3>
        <p className="text-[12px] leading-relaxed text-gray-700">{data.teacherComment || "No comment provided."}</p>
        {data.teacherName && <p className="text-[11px] text-gray-500 mt-1">— {data.teacherName}</p>}
      </div>

      <div className="px-6 py-3 text-center text-[9px] text-gray-400">
        Generated on {data.generatedAt ? new Date(data.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
        <br />
        Access School Portal — Weekly Report System
      </div>
    </div>
  )
})

WeeklyReportCard.displayName = "WeeklyReportCard"

export default WeeklyReportCard
