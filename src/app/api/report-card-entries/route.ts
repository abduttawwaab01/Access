import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import { computePosition } from "@/lib/report-card-constants"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")
  const term = searchParams.get("term")
  const session = searchParams.get("session")
  const classId = searchParams.get("classId")

  if (studentId && term && session) {
    const entry = await db.reportCardEntries.get(studentId, term, session)
    let position: number | null = null
    if (classId && entry) {
      const allResults = await prisma.result.findMany({ where: { classId, term, session } })
      position = computePosition(allResults, studentId, classId, term, session)
    }
    return NextResponse.json({ entry, position })
  }

  if (studentId) {
    const entries = await db.reportCardEntries.getByStudent(studentId)
    return NextResponse.json(entries)
  }

  return NextResponse.json([])
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const { studentId, classId, term, session, teacherComment, teacherName, principalComment, nextTerm, domains } = body

  if (!studentId || !classId || !term || !session) {
    return NextResponse.json({ error: "studentId, classId, term, and session are required" }, { status: 400 })
  }

  const entry = await db.reportCardEntries.upsert({
    studentId,
    classId,
    term,
    session,
    teacherComment: teacherComment || null,
    teacherName: teacherName || null,
    principalComment: principalComment || null,
    nextTerm: nextTerm || null,
    domains: domains || null,
  })

  return NextResponse.json(entry, { status: 201 })
}
