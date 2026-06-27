import { NextRequest, NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const teacherId = searchParams.get("teacherId")
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
    if (teacherId) {
      const ta = await db.teacherAssignments.getByTeacher(teacherId)
      if (!ta) {
        return NextResponse.json({ data: [], total: 0, page, pageSize, totalPages: 0 }, cacheHeader())
      }
      const cids = (ta.classIds || []) as string[]
      const sids = (ta.subjectIds || []) as string[]
      const where: any = { classId: { in: cids }, subjectId: { in: sids } }
      const result = await paginatedQuery(
        prisma.lessonNote,
        { where, orderBy: { createdAt: "desc" } },
        { page, pageSize }
      )
      return NextResponse.json(result, cacheHeader())
    }
    const where: any = {}
    if (classId) where.classId = classId
    const result = await paginatedQuery(
      prisma.lessonNote,
      { where, orderBy: { createdAt: "desc" } },
      { page, pageSize }
    )
    return NextResponse.json(result, cacheHeader())
  }

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
  return NextResponse.json(result, cacheHeader())
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
