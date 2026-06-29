import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const teacherId = searchParams.get("teacherId")
  const summary = searchParams.get("summary") === "true"
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  if (teacherId) {
    const [tc, ts] = await Promise.all([
      db.teacherClasses.getByTeacher(teacherId),
      db.teacherSubjects.getByTeacher(teacherId),
    ])
    const classIds = tc.map((t: any) => t.classId)
    if (classIds.length === 0) return NextResponse.json([], cacheHeader())
    const students = await prisma.student.findMany({ where: { classId: { in: classIds } }, select: { id: true } })
    const studentIds = students.map((s) => s.id)
    if (studentIds.length === 0) return NextResponse.json([], cacheHeader())
    const records = await prisma.attendanceRecord.findMany({ where: { studentId: { in: studentIds } }, orderBy: { date: "desc" } })
    return NextResponse.json(records, cacheHeader())
  }

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
    if (summary) return NextResponse.json(await db.attendance.getSummary(studentId || ""), cacheHeader())
    const where: any = {}
    if (studentId) where.studentId = studentId
    const result = await paginatedQuery(
      prisma.attendanceRecord,
      { where, orderBy: { date: "desc" } },
      { page, pageSize }
    )
    return NextResponse.json(result, cacheHeader())
  }

  if (!studentId) return NextResponse.json(await db.attendance.getAll(), cacheHeader())
  if (summary) return NextResponse.json(await db.attendance.getSummary(studentId), cacheHeader())
  return NextResponse.json(await db.attendance.getByStudent(studentId), cacheHeader())
}
