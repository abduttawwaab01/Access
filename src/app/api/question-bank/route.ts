import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const subjectId = searchParams.get("subjectId") || undefined
  const approved = searchParams.get("approved")
  const teacherId = searchParams.get("teacherId")

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
    ...q,
    subjectName: subjects.find((s: any) => s.id === q.subjectId)?.name || "Unknown",
    className: classes.find((c: any) => c.id === q.classId)?.name || "Unknown",
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const item = await db.questions.create(body)
  return NextResponse.json(item, { status: 201 })
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
    return NextResponse.json(await db.questions.update(questionId, data))
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  return NextResponse.json({ deleted: await db.questions.delete(id) })
}
