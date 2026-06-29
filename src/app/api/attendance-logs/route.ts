import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || undefined
  const date = searchParams.get("date") || undefined
  const teacherId = searchParams.get("teacherId")
  const classId = searchParams.get("classId") || undefined

  // If teacherId provided, filter by teacher's assigned students
  if (teacherId) {
    const tc = await db.teacherClasses.getByTeacher(teacherId)
    const classIds = tc.map((t: any) => t.classId)
    if (classIds.length === 0) return NextResponse.json([])

    const students = classIds.length > 0
      ? await db.students.getAll().then((all: any[]) => all.filter((s: any) => classIds.includes(s.classId)))
      : []
    const studentIds = new Set(students.map((s: any) => s.id))
    const allLogs = await db.attendanceLogs.getAll()
    const filtered = allLogs.filter((l: any) => studentIds.has(l.userId))
    if (userId) return NextResponse.json(filtered.filter((l: any) => l.userId === userId))
    return NextResponse.json(filtered)
  }

  if (userId) return NextResponse.json(await db.attendanceLogs.getByUser(userId))
  if (date) return NextResponse.json(await db.attendanceLogs.getAll())
  return NextResponse.json(await db.attendanceLogs.getAll())
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const sessionUser = auth.user as any
  const body = await request.json()

  // Admins can mark attendance for anyone without createdBy
  // Teachers must provide createdBy and be assigned to the student's class
  if (sessionUser.role !== "admin" && body.userType !== "staff" && !body.createdBy) {
    return NextResponse.json({ error: "createdBy (teacherId) is required for student attendance" }, { status: 400 })
  }

  // For non-admin marking a student, validate teacher-class assignment
  if (sessionUser.role !== "admin" && body.userType !== "staff") {
    const student = await db.students.getById(body.userId)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    const teacherId = body.createdBy || sessionUser.id
    const tc = await db.teacherClasses.getByTeacher(teacherId)
    const assignedClassIds = tc.map((t: any) => t.classId)
    if (!assignedClassIds.includes(student.classId)) {
      return NextResponse.json({ error: "You are not assigned to this student's class" }, { status: 403 })
    }
  }

  const existing = await db.attendanceLogs.getByUserAndDate(body.userId, body.date)
  if (existing) {
    return NextResponse.json({ error: "Already marked" }, { status: 409 })
  }
  const item = await db.attendanceLogs.create(body)
  return NextResponse.json(item, { status: 201 })
}
