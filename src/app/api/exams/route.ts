import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  const type = searchParams.get("type") || undefined
  const studentId = searchParams.get("studentId") || undefined
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")
  const page = parseInt(pageRaw || "1", 10)
  const pageSize = parseInt(pageSizeRaw || "50", 10)

  try {
    if (pageRaw) {
      const where: any = {}
      if (subjectId) where.subjectId = subjectId
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
            where.subjectId = { in: studentSubjectIds }
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
        exams = studentSubjectIds.length > 0
          ? exams.filter((exam: any) => exam.classId === studentClassId && studentSubjectIds.includes(exam.subjectId))
          : exams.filter((exam: any) => exam.classId === studentClassId)
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
  try {
    const body = await request.json()
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
