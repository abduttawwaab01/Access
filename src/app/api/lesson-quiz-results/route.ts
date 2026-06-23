import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const lessonNoteId = searchParams.get("lessonNoteId")
  let result: any[]
  if (studentId && lessonNoteId) {
    const item = await db.lessonQuizResults.getByStudentAndLessonNote(studentId, lessonNoteId)
    return NextResponse.json(item || null)
  }
  if (studentId) result = await db.lessonQuizResults.getByStudent(studentId)
  else if (lessonNoteId) result = await db.lessonQuizResults.getByLessonNote(lessonNoteId)
  else result = await db.lessonQuizResults.getAll()
  const students = await db.students.getAll()
  const notes = await db.lessonNotes.getAll()
  return NextResponse.json(result.map((r: any) => ({
    ...r,
    studentName: (() => { const s = students.find((s: any) => s.id === r.studentId); return s ? `${s.firstName} ${s.lastName}` : "Unknown" })(),
    lessonTitle: notes.find((n: any) => n.id === r.lessonNoteId)?.title || "Unknown",
  })))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = await db.lessonQuizResults.create(body)
  return NextResponse.json(item, { status: 201 })
}
