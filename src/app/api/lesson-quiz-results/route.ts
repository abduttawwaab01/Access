import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const lessonNoteId = searchParams.get("lessonNoteId")
  let result: any[]
  if (studentId && lessonNoteId) {
    const item = store.lessonQuizResults.getByStudentAndLessonNote(studentId, lessonNoteId)
    return NextResponse.json(item || null)
  }
  if (studentId) result = store.lessonQuizResults.getByStudent(studentId)
  else if (lessonNoteId) result = store.lessonQuizResults.getByLessonNote(lessonNoteId)
  else result = store.lessonQuizResults.getAll()
  const students = store.students.getAll()
  const notes = store.lessonNotes.getAll()
  return NextResponse.json(result.map((r: any) => ({
    ...r,
    studentName: students.find((s: any) => s.id === r.studentId) ? `${students.find((s: any) => s.id === r.studentId).firstName} ${students.find((s: any) => s.id === r.studentId).lastName}` : "Unknown",
    lessonTitle: notes.find((n: any) => n.id === r.lessonNoteId)?.title || "Unknown",
  })))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = store.lessonQuizResults.create(body)
  return NextResponse.json(item, { status: 201 })
}
