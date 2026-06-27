import { NextRequest, NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

function mapQuestion(q: any) {
  return {
    id: q.id,
    subjectId: q.subjectId,
    classId: q.classId,
    text: q.question,
    type: q.type || "mcq",
    options: q.options,
    correctAnswer: q.answer,
    difficulty: q.difficulty,
    topic: q.topic,
    points: q.points,
    approved: q.approved,
    approvedBy: q.approvedBy,
    createdBy: q.createdBy,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const subjectId = searchParams.get("subjectId") || undefined
  const approved = searchParams.get("approved")
  const teacherId = searchParams.get("teacherId")
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
    let where: any = {}
    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId
    if (approved === "true") where.approved = true
    else if (approved === "false") where.approved = false
    const difficulty = searchParams.get("difficulty")
    if (difficulty) where.difficulty = difficulty

    if (teacherId) {
      const ta = await db.teacherAssignments.getByTeacher(teacherId)
      if (!ta) {
        return NextResponse.json({ data: [], total: 0, page, pageSize, totalPages: 0 }, cacheHeader())
      }
      const cids = (ta.classIds || []) as string[]
      const sids = (ta.subjectIds || []) as string[]
      where = { ...where, classId: { in: cids }, subjectId: { in: sids } }
    }

    const { data, total, page: p, pageSize: ps, totalPages } = await paginatedQuery(
      prisma.question,
      { where, orderBy: { createdAt: "desc" }, include: { subject: true, class: true } },
      { page, pageSize }
    )
    const mapped = data.map((q: any) => ({
      ...mapQuestion(q),
      subjectName: q.subject?.name || "Unknown",
      className: q.class?.name || "Unknown",
    }))
    return NextResponse.json({ data: mapped, total, page: p, pageSize: ps, totalPages }, cacheHeader())
  }

  let result: any[]
  if (teacherId) {
    const all = await db.questions.getAll()
    const ta = await db.teacherAssignments.getByTeacher(teacherId)
    if (ta) {
      const cids = (ta.classIds || []) as string[]
      const sids = (ta.subjectIds || []) as string[]
      result = all.filter((q: any) => cids.includes(q.classId) && sids.includes(q.subjectId))
    } else {
      result = []
    }
  } else {
    result = await db.questions.getAll(subjectId, classId, approved === "true" ? true : approved === "false" ? false : undefined)
  }
  const subjects = await db.subjects.getAll()
  const classes = await db.classes.getAll()
  result = result.map((q: any) => ({
    ...mapQuestion(q),
    subjectName: subjects.find((s: any) => s.id === q.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === q.classId)?.name || "Unknown",
  }))
  return NextResponse.json(result, cacheHeader())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = await db.questions.create(body)
  return NextResponse.json(mapQuestion(item), { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { action, ids, approvedBy, questionId, data } = await request.json()
  if (action === "approve" && questionId) {
    return NextResponse.json(await db.questions.approve(questionId, approvedBy))
  }
  if (action === "reject" && questionId) {
    return NextResponse.json(await db.questions.reject(questionId))
  }
  if (action === "update" && questionId && data) {
    const item = await db.questions.update(questionId, data)
    return NextResponse.json(item ? mapQuestion(item) : null)
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: await db.questions.delete(id) })
}
