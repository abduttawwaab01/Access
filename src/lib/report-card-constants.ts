export interface GradeBoundary {
  min: number
  grade: string
  remark: string
}

export const STANDARD_DOMAINS = [
  { name: "Punctuality", max: 10 },
  { name: "Neatness", max: 10 },
  { name: "Attentiveness", max: 10 },
  { name: "Honesty", max: 10 },
  { name: "Leadership", max: 10 },
  { name: "Participation", max: 10 },
]

export const DEFAULT_GRADE_BOUNDARIES: GradeBoundary[] = [
  { min: 75, grade: "A", remark: "Excellent" },
  { min: 65, grade: "B", remark: "Very Good" },
  { min: 55, grade: "C", remark: "Good" },
  { min: 45, grade: "D", remark: "Fair" },
  { min: 35, grade: "E", remark: "Poor" },
  { min: 0, grade: "F", remark: "Fail" },
]

export function getGradeFromBoundaries(pct: number, boundaries: GradeBoundary[]): { grade: string; remark: string } {
  const sorted = [...boundaries].sort((a, b) => b.min - a.min)
  for (const b of sorted) {
    if (pct >= b.min) return { grade: b.grade, remark: b.remark }
  }
  const last = sorted[sorted.length - 1]
  return { grade: last?.grade || "F", remark: last?.remark || "Fail" }
}

export const DEFAULT_NEXT_TERM = ""

export function computePosition(
  results: any[],
  targetStudentId: string,
  classId: string,
  term: string,
  session: string,
): number | null {
  const classResults = results.filter(
    (r) => r.classId === classId && r.term === term && r.session === session,
  )
  if (classResults.length === 0) return null

  const studentAverages: { studentId: string; avg: number }[] = []
  const groups: Record<string, { total: number; count: number }> = {}

  for (const r of classResults) {
    if (!groups[r.studentId]) groups[r.studentId] = { total: 0, count: 0 }
    const score = r.score || (r.caScore || 0) + (r.examScore || 0)
    const max = r.totalMax || 100
    groups[r.studentId].total += max > 0 ? (score / max) * 100 : 0
    groups[r.studentId].count++
  }

  for (const [sid, g] of Object.entries(groups)) {
    studentAverages.push({ studentId: sid, avg: g.count > 0 ? g.total / g.count : 0 })
  }

  studentAverages.sort((a, b) => b.avg - a.avg)

  const idx = studentAverages.findIndex((s) => s.studentId === targetStudentId)
  return idx >= 0 ? idx + 1 : null
}

export function computeCumulativeResults(
  results: any[],
  studentId: string,
  session: string,
): { termResults: Record<string, any[]>; subjectAverages: { subject: string; score: number; total: number; grade: string; remark: string }[]; totalScore: number; totalMax: number; average: number } {
  const studentResults = results.filter((r) => r.studentId === studentId && r.session === session)
  const termNames = [...new Set(studentResults.map((r) => r.term))] as string[]
  termNames.sort()

  const termResults: Record<string, any[]> = {}
  for (const term of termNames) {
    termResults[term] = studentResults.filter((r) => r.term === term)
  }

  const subjectGroups: Record<string, { totalScore: number; totalMax: number; count: number }> = {}
  for (const r of studentResults) {
    if (!subjectGroups[r.subject]) {
      subjectGroups[r.subject] = { totalScore: 0, totalMax: 0, count: 0 }
    }
    subjectGroups[r.subject].totalScore += r.score || 0
    subjectGroups[r.subject].totalMax += r.totalMax || 100
    subjectGroups[r.subject].count++
  }

  const subjectAverages = Object.entries(subjectGroups).map(([subject, g]) => {
    const pct = g.totalMax > 0 ? (g.totalScore / g.totalMax) * 100 : 0
    const grade = getGradeFromBoundaries(pct, DEFAULT_GRADE_BOUNDARIES)
    return {
      subject,
      score: Math.round(g.totalScore / g.count),
      total: Math.round(g.totalMax / g.count),
      grade: grade.grade,
      remark: grade.remark,
    }
  })

  const totalScore = Object.values(subjectGroups).reduce((s, g) => s + g.totalScore, 0)
  const totalMax = Object.values(subjectGroups).reduce((s, g) => s + g.totalMax, 0)
  const average = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  return { termResults, subjectAverages, totalScore, totalMax, average }
}
