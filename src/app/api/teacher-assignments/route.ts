import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  const assigns = await db.teacherAssignments.getAll()
  const staff = await db.staff.getAll()
  const result = assigns.map((a: any) => {
    const s = staff.find((st: any) => st.id === a.teacherId)
    return { ...a, teacherName: s ? `${s.firstName} ${s.lastName}` : "Unknown" }
  })
  return NextResponse.json(result)
}

export async function PUT(request: NextRequest) {
  const { teacherId, classIds, subjectIds, isClassTeacher } = await request.json()
  const item = await db.teacherAssignments.upsert(teacherId, { classIds, subjectIds, isClassTeacher: isClassTeacher || false })
  return NextResponse.json(item)
}
