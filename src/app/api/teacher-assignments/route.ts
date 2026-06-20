import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  const assigns = store.teacherAssignments.getAll()
  const staff = store.staff.getAll()
  const result = assigns.map((a: any) => {
    const s = staff.find((st: any) => st.id === a.teacherId)
    return { ...a, teacherName: s ? `${s.firstName} ${s.lastName}` : "Unknown" }
  })
  return NextResponse.json(result)
}

export async function PUT(request: NextRequest) {
  const { teacherId, classIds, subjectIds, isClassTeacher } = await request.json()
  const existing = store.teacherAssignments.getByTeacher(teacherId)
  if (existing) {
    return NextResponse.json(store.teacherAssignments.update(teacherId, { classIds, subjectIds, isClassTeacher }))
  }
  return NextResponse.json(store.teacherAssignments.create({ teacherId, classIds, subjectIds, isClassTeacher: isClassTeacher || false }))
}
