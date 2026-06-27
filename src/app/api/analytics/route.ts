import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cacheHeader } from "@/lib/cache-header"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const schoolId = request.headers.get("x-school-id") || ""

  const where = { schoolId }
  const [totalStudents, totalTeachers, totalClasses, totalSubjects, totalQuestions, totalExams] = await Promise.all([
    prisma.student.count({ where }),
    prisma.user.count({ where: { ...where, role: "teacher" } }),
    prisma.class.count({ where }),
    prisma.subject.count({ where }),
    prisma.question.count({ where }),
    prisma.exam.count({ where }),
  ])

  const [activeStudents, activeTerms, currentSessions] = await Promise.all([
    prisma.student.count({ where: { status: "active" } }),
    prisma.academicSession.count({ where: { isCurrent: true } }),
    prisma.examSession.count({ where: { status: "in_progress" } }),
  ])

  const monthStats = await prisma.$queryRaw<any[]>`
    SELECT
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as count
    FROM "Student"
    WHERE "schoolId" = ${schoolId}
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
  `

  const termStats = await prisma.result.groupBy({
    by: ["term", "session"],
    _count: { id: true },
    where: { schoolId },
  })

  const subjectPerformance = await prisma.result.groupBy({
    by: ["subjectId"],
    _avg: { score: true, total: true },
    where: { schoolId },
  })

  const subjectsWithNames = await prisma.subject.findMany({
    where,
    select: { id: true, name: true },
  })

  const performanceWithNames = subjectPerformance.map((sp) => {
    const subject = subjectsWithNames.find((s) => s.id === sp.subjectId)
    return {
      subjectId: sp.subjectId,
      subjectName: subject?.name || sp.subjectId,
      avgScore: sp._avg.score ?? 0,
      avgTotal: sp._avg.total ?? 0,
      count: 0,
    }
  })

  return NextResponse.json({
    overview: {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalQuestions,
      totalExams,
      activeStudents,
      activeTerms,
      currentSessions,
    },
    monthStats,
    termStats,
    subjectPerformance: performanceWithNames,
  }, cacheHeader(60))
}