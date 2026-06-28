import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const examId = searchParams.get("examId") || undefined
  const teacherId = searchParams.get("teacherId")
  const studentId = searchParams.get("studentId") || undefined

  if (studentId) {
    const allSessions = await db.examSessions.getAll()
    return NextResponse.json(allSessions.filter((s: any) => s.studentId === studentId))
  }

  // If teacherId provided, filter sessions by teacher's assigned classes' exams
  if (teacherId) {
    const tc = await db.teacherClasses.getByTeacher(teacherId)
    const classIds = tc.map((t: any) => t.classId)
    if (classIds.length === 0) return NextResponse.json([])

    const allExams = await db.exams.getAll()
    const myExamIds = allExams.filter((e: any) => classIds.includes(e.classId)).map((e: any) => e.id)
    if (myExamIds.length === 0) return NextResponse.json([])

    const allSessions = await db.examSessions.getAll()
    const filtered = allSessions.filter((s: any) => myExamIds.includes(s.examId))
    if (examId) return NextResponse.json(filtered.filter((s: any) => s.examId === examId))
    return NextResponse.json(filtered)
  }

  try {
    const sessions = await db.examSessions.getAll(examId)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching exam sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam sessions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.examId || (!body.studentId && body.examType !== "entrance")) {
      return NextResponse.json(
        { error: "examId and studentId are required" },
        { status: 400 }
      )
    }
    const item = await db.examSessions.create(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating exam session:", error)
    if (error instanceof Error) {
      if (error.message === "Exam not found") {
        return NextResponse.json(
          { error: "Exam not found" },
          { status: 404 }
        )
      }
      if (error.message === "Student not found") {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        )
      }
      if (error.message === "Student is not enrolled in the class for this exam") {
        return NextResponse.json(
          { error: "Student is not enrolled in the class for this exam" },
          { status: 403 }
        )
      }
    }
    return NextResponse.json(
      { error: "Failed to create exam session" },
      { status: 500 }
    )
  }
}
