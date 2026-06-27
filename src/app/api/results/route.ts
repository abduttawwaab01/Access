import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const classId = searchParams.get("classId")
  const subjectId = searchParams.get("subjectId")
  const term = searchParams.get("term") || undefined
  const examId = searchParams.get("examId") || undefined
  const pageRaw = searchParams.get("page")
  const pageSizeRaw = searchParams.get("pageSize")

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(pageSizeRaw || "50", 10)
    const where: any = {}
    if (studentId) where.studentId = studentId
    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId
    if (term) where.term = term
    if (examId) where.examId = examId
    const session = searchParams.get("session") || undefined
    if (session) where.session = session

    const result = await paginatedQuery(
      prisma.result,
      { where, include: { subject: true }, orderBy: { createdAt: "desc" } },
      { page, pageSize }
    )

    const mapped = result.data.map((r: any) => ({
      ...r,
      subject: r.subject?.name || r.subjectId,
    }))

    return NextResponse.json({ data: mapped, total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages }, cacheHeader())
  }

  const session = searchParams.get("session") || undefined
  let results: any[]
  if (classId && subjectId) {
    results = await db.results.getByClassAndSubject(classId, subjectId, term, session, examId)
  } else if (classId && !subjectId) {
    results = await db.results.getByClass(classId, term, session)
  } else if (studentId) {
    if (term) results = await db.results.getByStudentAndTerm(studentId, term)
    else results = await db.results.getByStudent(studentId)
  } else {
    results = await db.results.getAll()
  }
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } })
  const subjectMap = Object.fromEntries(subjects.map((s: any) => [s.id, s.name]))
  results = results.map((r: any) => ({ ...r, subject: subjectMap[r.subjectId] || r.subjectId }))
  return NextResponse.json(results, cacheHeader())
}

export async function POST(request: Request) {
  const body = await request.json()
  if (Array.isArray(body)) {
    const items = await Promise.all(body.map((data: any) => db.results.upsert(data)))
    return NextResponse.json(items)
  }
  const item = await db.results.upsert(body)
  return NextResponse.json(item)
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (body.id) {
    const item = await db.results.update(body.id, body)
    if (!item) return NextResponse.json({ error: "Result not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  return NextResponse.json({ error: "id is required" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const all = searchParams.get("all")
  if (all === "true") {
    await db.results.deleteAll()
    return NextResponse.json({ success: true })
  }
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
  const ok = await db.results.delete(id)
  if (!ok) return NextResponse.json({ error: "Result not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
