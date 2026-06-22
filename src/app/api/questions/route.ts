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

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const body = await request.json()

  if (action === "approveAll") {
    const { ids, approvedBy } = body
    if (!ids || !approvedBy) {
      return NextResponse.json({ error: "ids and approvedBy are required" }, { status: 400 })
    }
    store.questions.approveAll(ids, approvedBy)
    return NextResponse.json({ success: true })
  }

  if (action === "approve" && body.id) {
    return NextResponse.json(store.questions.approve(body.id, body.approvedBy))
  }

  if (action === "reject" && body.id) {
    return NextResponse.json(store.questions.reject(body.id))
  }

  if (action === "update" && body.id && body.data) {
    return NextResponse.json(store.questions.update(body.id, body.data))
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }
  return NextResponse.json({ deleted: store.questions.delete(id) })
}
