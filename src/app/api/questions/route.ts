import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  const result = store.questions.getAll(subjectId, classId)
  const subjects = store.subjects.getAll()
  const classes = store.classes.getAll()
  return NextResponse.json(result.map((q: any) => ({
    ...q,
    subjectName: subjects.find((s: any) => s.id === q.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === q.classId)?.name || "Unknown",
  })))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.questions.create(body)
  return NextResponse.json(item, { status: 201 })
}
