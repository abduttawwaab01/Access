export const STANDARD_DOMAINS = [
  { name: "Punctuality", max: 10 },
  { name: "Neatness", max: 10 },
  { name: "Attentiveness", max: 10 },
  { name: "Honesty", max: 10 },
  { name: "Leadership", max: 10 },
  { name: "Participation", max: 10 },
]

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
    const max = r.totalMax || r.total || 100
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
