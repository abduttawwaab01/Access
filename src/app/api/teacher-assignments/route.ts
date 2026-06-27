import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get("teacherId")
  if (teacherId) {
    const [ta, tc, ts] = await Promise.all([
      db.teacherAssignments.getByTeacher(teacherId),
      db.teacherClasses.getByTeacher(teacherId),
      db.teacherSubjects.getByTeacher(teacherId),
    ])
    return NextResponse.json({
      teacherAssignment: ta,
      teacherClasses: tc,
      teacherSubjects: ts,
      classIds: tc.map((t: any) => t.classId),
      subjectIds: ts.map((t: any) => t.subjectId),
    })
  }
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
  const schoolId = (await db.staff.getById(teacherId))?.schoolId || ""

  const [tc, ts] = await Promise.all([
    db.teacherClasses.setAssignments(teacherId, classIds || [], isClassTeacher || false),
    db.teacherSubjects.setAssignments(teacherId, subjectIds || []),
  ])

  const item = await db.teacherAssignments.upsert(teacherId, {
    classIds: classIds || [],
    subjectIds: subjectIds || [],
    isClassTeacher: isClassTeacher || false,
  })

  return NextResponse.json({ ...item, teacherClasses: tc, teacherSubjects: ts })
}
