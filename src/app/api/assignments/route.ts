import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const teacherId = searchParams.get("teacherId")

  // If teacherId provided, filter by teacher's assigned classes
  if (teacherId) {
    const tc = await db.teacherClasses.getByTeacher(teacherId)
    const classIds = tc.map((t: any) => t.classId)
    if (classIds.length === 0) return NextResponse.json([])
    const allAssignments = await db.assignments.getAll()
    const filtered = allAssignments.filter((a: any) => classIds.includes(a.classId))
    return NextResponse.json(filtered)
  }

  return NextResponse.json(await db.assignments.getAll(classId))
}

export async function POST(request: Request) {
  const body = await request.json()
  // Require createdBy for teacher-created assignments
  if (body.createdBy && body.classId) {
    const tc = await db.teacherClasses.getByTeacher(body.createdBy)
    const assignedClassIds = tc.map((t: any) => t.classId)
    if (!assignedClassIds.includes(body.classId)) {
      return NextResponse.json({ error: "You are not assigned to this class" }, { status: 403 })
    }
  }
  const item = await db.assignments.create(body)
  return NextResponse.json(item, { status: 201 })
}
