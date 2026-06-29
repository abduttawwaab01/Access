import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  const type = searchParams.get("type") || undefined
  const studentId = searchParams.get("studentId") || undefined
  const teacherId = searchParams.get("teacherId")
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")
  const page = parseInt(pageRaw || "1", 10)
  const pageSize = parseInt(pageSizeRaw || "50", 10)

  // If teacherId provided, filter by teacher's assigned classes/subjects
  if (teacherId) {
    const [tc, ts] = await Promise.all([
      db.teacherClasses.getByTeacher(teacherId),
      db.teacherSubjects.getByTeacher(teacherId),
    ])
    const classIds = tc.map((t: any) => t.classId)
    const teacherSubjectIds = ts.map((t: any) => t.subjectId)

    if (classIds.length === 0) return NextResponse.json([], cacheHeader())

    const where: any = { classId: { in: classIds } }
    if (teacherSubjectIds.length > 0) where.subjectIds = { hasSome: teacherSubjectIds }
    if (subjectId) where.subjectIds = { has: subjectId }
    if (classId) where.classId = classId
    if (type) where.type = type

    if (pageRaw) {
      const result = await paginatedQuery(
        prisma.exam,
        { where, orderBy: { createdAt: "desc" } },
        { page, pageSize }
      )
      return NextResponse.json(result, cacheHeader())
    }

    const exams = await db.exams.getAll(undefined, undefined, type, teacherSubjectIds.length > 0 ? teacherSubjectIds : undefined)
    const filtered = exams.filter((e: any) => classIds.includes(e.classId))
    if (subjectId) return NextResponse.json(filtered.filter((e: any) => (e.subjectIds || []).includes(subjectId)), cacheHeader())
    return NextResponse.json(filtered, cacheHeader())
  }

  try {
    if (pageRaw) {
      const where: any = {}
      if (subjectId) where.subjectIds = { has: subjectId }
      if (classId) where.classId = classId
      if (type) where.type = type

      if (studentId) {
        const student = await db.students.getById(studentId)
        if (student) {
          const studentClassId = student.classId
          const studentSubjects = await db.subjects.getAll(studentClassId)
          const studentSubjectIds = studentSubjects.map((s: any) => s.id)
          where.classId = studentClassId
          if (studentSubjectIds.length > 0) {
            where.subjectIds = { hasSome: studentSubjectIds }
          }
        }
      }

      const result = await paginatedQuery(
        prisma.exam,
        { where, orderBy: { createdAt: "desc" } },
        { page, pageSize }
      )
      return NextResponse.json(result, cacheHeader())
    }

    let exams = await db.exams.getAll(subjectId, classId, type)
    if (studentId) {
      const student = await db.students.getById(studentId)
      if (student) {
        const studentClassId = student.classId
        const studentSubjects = await db.subjects.getAll(studentClassId)
        const studentSubjectIds = studentSubjects.map((s: any) => s.id)
        exams = exams.filter((exam: any) => {
          if (exam.classId !== studentClassId) return false
          if (studentSubjectIds.length === 0) return true
          const examSubjectIds = exam.subjectIds || [exam.subjectId]
          return examSubjectIds.some((sid: string) => studentSubjectIds.includes(sid))
        })
      }
    }
    return NextResponse.json(exams, cacheHeader())
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      cacheHeader()
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const body = await request.json()
    if (body.createdBy) {
      const [tc, ts] = await Promise.all([
        db.teacherClasses.getByTeacher(body.createdBy),
        db.teacherSubjects.getByTeacher(body.createdBy),
      ])
      const assignedClassIds = tc.map((t: any) => t.classId)
      const assignedSubjectIds = ts.map((t: any) => t.subjectId)
      if (body.classId && !assignedClassIds.includes(body.classId)) {
        return NextResponse.json({ error: "You are not assigned to this class" }, { status: 403 })
      }
      const sIds = body.subjectIds && body.subjectIds.length > 0 ? body.subjectIds : body.subjectId ? [body.subjectId] : []
      if (assignedSubjectIds.length > 0 && sIds.length > 0) {
        const unauthorized = sIds.filter((id: string) => !assignedSubjectIds.includes(id))
        if (unauthorized.length > 0) {
          return NextResponse.json({ error: "You are not assigned to one or more selected subjects" }, { status: 403 })
        }
      }
    }
    const item = await db.exams.create(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    )
  }
}