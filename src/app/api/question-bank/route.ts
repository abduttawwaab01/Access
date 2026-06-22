import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const subjectId = searchParams.get("subjectId") || undefined
  const approved = searchParams.get("approved")
  const teacherId = searchParams.get("teacherId")

  let result: any[]
  if (teacherId) {
    result = store.questions.getByTeacher(teacherId)
  } else {
    result = store.questions.getAll(subjectId, classId, approved === "true" ? true : approved === "false" ? false : undefined)
  }
  const subjects = store.subjects.getAll()
  const classes = store.classes.getAll()
  result = result.map((q: any) => ({
    ...q,
    subjectName: subjects.find((s: any) => s.id === q.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === q.classId)?.name || "Unknown",
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = store.questions.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { action, ids, approvedBy, questionId, data } = await request.json()
  if (action === "approve" && questionId) {
    return NextResponse.json(store.questions.approve(questionId, approvedBy))
  }
  if (action === "reject" && questionId) {
    return NextResponse.json(store.questions.reject(questionId))
  }
  if (action === "update" && questionId && data) {
    return NextResponse.json(store.questions.update(questionId, data))
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: store.questions.delete(id) })
}
