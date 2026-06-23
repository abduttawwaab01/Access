import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const subjectId = searchParams.get("subjectId") || undefined
  const teacherId = searchParams.get("teacherId")

  let result: any[]
  if (teacherId) {
    const ta = await db.teacherAssignments.getByTeacher(teacherId)
    if (!ta) return NextResponse.json([])
    const all = await db.schemeOfWorks.getAll()
    result = all.filter((s: any) => (ta.classIds as string[]).includes(s.classId) && (ta.subjectIds as string[]).includes(s.subjectId))
  } else {
    result = await db.schemeOfWorks.getAll(classId, subjectId)
  }
  const subjects = await db.subjects.getAll()
  const classes = await db.classes.getAll()
  const staff = await db.staff.getAll()
  result = result.map((s: any) => ({
    ...s,
    subjectName: subjects.find((sub: any) => sub.id === s.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === s.classId)?.name || "Unknown",
    creatorName: (() => { const st = staff.find((st: any) => st.id === s.createdBy); return st ? `${st.firstName} ${st.lastName}` : "Unknown" })(),
    approverName: s.approvedBy ? (() => { const st = staff.find((st: any) => st.id === s.approvedBy); return st ? `${st.firstName} ${st.lastName}` : "Unknown" })() : null,
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = await db.schemeOfWorks.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { action, id, data, approvedBy } = await request.json()
  if (action === "approve") {
    return NextResponse.json(await db.schemeOfWorks.approve(id, approvedBy))
  }
  if (action === "reject") {
    return NextResponse.json(await db.schemeOfWorks.reject(id))
  }
  if (action === "update" && data) {
    const existing = await db.schemeOfWorks.getById(id)
    if (existing?.status === "published") {
      data.status = "draft"
      data.approvedBy = null
      data.approvedAt = null
    }
    return NextResponse.json(await db.schemeOfWorks.update(id, data))
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: await db.schemeOfWorks.delete(id) })
}
