import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const teacherId = searchParams.get("teacherId")

  let result: any[]
  if (teacherId) {
    result = store.lessonNotes.getByTeacher(teacherId)
  } else {
    result = store.lessonNotes.getAll(classId)
  }
  const staff = store.staff.getAll()
  result = result.map((n: any) => ({
    ...n,
    creatorName: n.createdBy ? (staff.find((s: any) => s.id === n.createdBy) ? `${staff.find((s: any) => s.id === n.createdBy).firstName} ${staff.find((s: any) => s.id === n.createdBy).lastName}` : "Unknown") : "Unknown",
    approverName: n.approvedBy ? (staff.find((s: any) => s.id === n.approvedBy) ? `${staff.find((s: any) => s.id === n.approvedBy).firstName} ${staff.find((s: any) => s.id === n.approvedBy).lastName}` : "Unknown") : null,
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = store.lessonNotes.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { action, id, data, approvedBy } = await request.json()
  if (action === "approve") {
    return NextResponse.json(store.lessonNotes.approve(id, approvedBy))
  }
  if (action === "update" && data) {
    return NextResponse.json(store.lessonNotes.update(id, data))
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: store.lessonNotes.delete(id) })
}
