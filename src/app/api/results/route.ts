import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"

async function mapSubjectNames(results: any[]): Promise<any[]> {
  if (!results.length) return results
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } })
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]))
  return results.map((r: any) => ({
    ...r,
    subject: subjectMap[r.subjectId] || r.subjectId,
  }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const classId = searchParams.get("classId")
  const subjectId = searchParams.get("subjectId")
  const term = searchParams.get("term") || undefined
  const examId = searchParams.get("examId") || undefined

  if (classId && subjectId) {
    const session = searchParams.get("session") || undefined
    const results = await db.results.getByClassAndSubject(classId, subjectId, term, session, examId)
    return NextResponse.json(await mapSubjectNames(results))
  }
  if (classId && !subjectId) {
    const session = searchParams.get("session") || undefined
    const results = await db.results.getByClass(classId, term, session)
    return NextResponse.json(await mapSubjectNames(results))
  }
  if (studentId) {
    if (term) {
      const results = await db.results.getByStudentAndTerm(studentId, term)
      return NextResponse.json(await mapSubjectNames(results))
    }
    const results = await db.results.getByStudent(studentId)
    return NextResponse.json(await mapSubjectNames(results))
  }
  const results = await db.results.getAll()
  return NextResponse.json(await mapSubjectNames(results))
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
