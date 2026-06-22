import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const classId = searchParams.get("classId")
  const subjectId = searchParams.get("subjectId")
  const term = searchParams.get("term") || undefined

  if (classId && subjectId) {
    const session = searchParams.get("session") || undefined
    return NextResponse.json(store.results.getByClassAndSubject(classId, subjectId, term, session))
  }
  if (studentId) {
    if (term) return NextResponse.json(store.results.getByStudentAndTerm(studentId, term))
    return NextResponse.json(store.results.getByStudent(studentId))
  }
  return NextResponse.json(store.results.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  if (Array.isArray(body)) {
    const items = body.map((data: any) => store.results.create(data))
    return NextResponse.json(items, { status: 201 })
  }
  const item = store.results.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (body.id) {
    const item = store.results.update(body.id, body)
    if (!item) return NextResponse.json({ error: "Result not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  return NextResponse.json({ error: "id is required" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
  const ok = store.results.delete(id)
  if (!ok) return NextResponse.json({ error: "Result not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
