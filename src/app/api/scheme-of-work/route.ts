import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const subjectId = searchParams.get("subjectId") || undefined
  const teacherId = searchParams.get("teacherId")

  let result: any[]
  if (teacherId) {
    const ta = store.teacherAssignments.getByTeacher(teacherId)
    if (!ta) return NextResponse.json([])
    result = store.schemeOfWorks.getAll().filter((s: any) => ta.classIds.includes(s.classId) && ta.subjectIds.includes(s.subjectId))
  } else {
    result = store.schemeOfWorks.getAll(classId, subjectId)
  }
  const subjects = store.subjects.getAll()
  const classes = store.classes.getAll()
  const staff = store.staff.getAll()
  result = result.map((s: any) => ({
    ...s,
    subjectName: subjects.find((sub: any) => sub.id === s.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === s.classId)?.name || "Unknown",
    creatorName: staff.find((st: any) => st.id === s.createdBy) ? `${staff.find((st: any) => st.id === s.createdBy).firstName} ${staff.find((st: any) => st.id === s.createdBy).lastName}` : "Unknown",
    approverName: s.approvedBy ? (staff.find((st: any) => st.id === s.approvedBy) ? `${staff.find((st: any) => st.id === s.approvedBy).firstName} ${staff.find((st: any) => st.id === s.approvedBy).lastName}` : "Unknown") : null,
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = store.schemeOfWorks.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { action, id, data, approvedBy } = await request.json()
  if (action === "approve") {
    return NextResponse.json(store.schemeOfWorks.approve(id, approvedBy))
  }
  if (action === "reject") {
    return NextResponse.json(store.schemeOfWorks.reject(id))
  }
  if (action === "update" && data) {
    const existing = store.schemeOfWorks.getById(id)
    if (existing?.status === "published") {
      data.status = "draft"
      data.approvedBy = null
      data.approvedAt = null
    }
    return NextResponse.json(store.schemeOfWorks.update(id, data))
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: store.schemeOfWorks.delete(id) })
}
