import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const teacherId = searchParams.get("teacherId")

  let result: any[]
  if (teacherId) {
    const allNotes = await db.lessonNotes.getAll()
    const ta = await db.teacherAssignments.getByTeacher(teacherId)
    if (ta) {
      const cids = (ta.classIds || []) as string[]
      const sids = (ta.subjectIds || []) as string[]
      result = allNotes.filter((n: any) => cids.includes(n.classId) && sids.includes(n.subjectId))
    } else {
      result = []
    }
  } else {
    result = await db.lessonNotes.getAll(classId)
  }
  const staff = await db.staff.getAll()
  result = result.map((n: any) => ({
    ...n,
    creatorName: n.createdBy ? (() => { const s = staff.find((s: any) => s.id === n.createdBy); return s ? `${s.firstName} ${s.lastName}` : "Unknown" })() : "Unknown",
    approverName: n.approvedBy ? (() => { const s = staff.find((s: any) => s.id === n.approvedBy); return s ? `${s.firstName} ${s.lastName}` : "Unknown" })() : null,
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = await db.lessonNotes.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { action, id, data, approvedBy, status } = body
  if (action === "approve" || status === "approved") {
    return NextResponse.json(await db.lessonNotes.approve(id, approvedBy || action === "approve" ? approvedBy : "4"))
  }
  if (action === "reject" || status === "rejected") {
    return NextResponse.json(await db.lessonNotes.reject(id))
  }
  if (action === "update" && data) {
    return NextResponse.json(await db.lessonNotes.update(id, data))
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: await db.lessonNotes.delete(id) })
}
