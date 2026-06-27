import { NextResponse } from "next/server"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { cacheHeader } from "@/lib/cache-header"

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  const approved = searchParams.get("approved")
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  const where: any = {}
  if (subjectId) where.subjectId = subjectId
  if (classId) where.classId = classId
  if (approved === "true") where.approved = true
  else if (approved === "false") where.approved = false

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
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

  const result = await db.questions.getAll(subjectId, classId)
  const subjects = await db.subjects.getAll()
  const classes = await db.classes.getAll()
  return NextResponse.json(result.map((q: any) => ({
    ...mapQuestion(q),
    subjectName: subjects.find((s: any) => s.id === q.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === q.classId)?.name || "Unknown",
  })), cacheHeader())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.questions.create(body)
  return NextResponse.json(mapQuestion(item), { status: 201 })
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
    for (const id of ids) {
      await db.questions.approve(id, approvedBy)
    }
    return NextResponse.json({ success: true })
  }

  if (action === "approve" && body.id) {
    return NextResponse.json(await db.questions.approve(body.id, body.approvedBy))
  }

  if (action === "reject" && body.id) {
    return NextResponse.json(await db.questions.reject(body.id))
  }

  if (action === "update" && body.id && body.data) {
    const item = await db.questions.update(body.id, body.data)
    return NextResponse.json(item ? mapQuestion(item) : null)
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }
  return NextResponse.json({ deleted: await db.questions.delete(id) })
}
