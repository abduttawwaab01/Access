import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const subjectId = searchParams.get("subjectId") || undefined
  const teacherId = searchParams.get("teacherId")

  let result: any[]
  if (teacherId) {
    const [tc, ts] = await Promise.all([
      db.teacherClasses.getByTeacher(teacherId),
      db.teacherSubjects.getByTeacher(teacherId),
    ])
    const cids = tc.map((t: any) => t.classId)
    const sids = ts.map((t: any) => t.subjectId)
    if (cids.length === 0) return NextResponse.json([])
    const all = await db.schemeOfWorks.getAll(undefined, undefined)
    result = all.filter((s: any) => cids.includes(s.classId) && (sids.length === 0 || sids.includes(s.subjectId)))
  } else {
    const schoolId = searchParams.get("schoolId") || undefined
    result = await db.schemeOfWorks.getAll(classId, subjectId, schoolId)
  }
  const subjects = await db.subjects.getAll()
  const classes = await db.classes.getAll()
  const staff = await db.staff.getAll()
  result = result.map((s: any) => {
    const content = s.content as any || {}
    return {
      ...s,
      weeks: content.weeks || [],
      term: content.term || "",
      session: content.session || "",
      subjectName: subjects.find((sub: any) => sub.id === s.subjectId)?.name || "Unknown",
      className: classes.find((c: any) => c.id === s.classId)?.name || "Unknown",
      creatorName: (() => { const st = staff.find((st: any) => st.id === s.createdBy); return st ? `${st.firstName} ${st.lastName}` : "Unknown" })(),
      approverName: s.approvedBy ? (() => { const st = staff.find((st: any) => st.id === s.approvedBy); return st ? `${st.firstName} ${st.lastName}` : "Unknown" })() : null,
    }
  })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin" && user.role !== "teacher") return NextResponse.json({ error: "Only admins and teachers can create schemes of work" }, { status: 403 })
  const body = await request.json()
  if (!body.title || !body.classId || !body.subjectId) {
    return NextResponse.json({ error: "title, classId, and subjectId are required" }, { status: 400 })
  }
  const item = await db.schemeOfWorks.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin" && user.role !== "teacher") return NextResponse.json({ error: "Only admins and teachers can update schemes of work" }, { status: 403 })
  const { action, id, data, approvedBy } = await request.json()
  if (action === "approve") {
    if (user.role !== "admin") return NextResponse.json({ error: "Only admins can approve schemes of work" }, { status: 403 })
    return NextResponse.json(await db.schemeOfWorks.approve(id, approvedBy || user.id))
  }
  if (action === "reject") {
    if (user.role !== "admin") return NextResponse.json({ error: "Only admins can reject schemes of work" }, { status: 403 })
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
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can delete schemes of work" }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: await db.schemeOfWorks.delete(id) })
}
