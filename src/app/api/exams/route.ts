import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  const type = searchParams.get("type") || undefined
  const studentId = searchParams.get("studentId") || undefined
  
  try {
    let exams = await db.exams.getAll(subjectId, classId, type)
    
    if (studentId) {
      const student = await db.students.getById(studentId)
      if (student) {
        const studentClassId = student.classId
        const studentSubjects = await db.subjects.getAll(studentClassId)
        const studentSubjectIds = studentSubjects.map((s: any) => s.id)
        
        exams = studentSubjectIds.length > 0
          ? exams.filter((exam: any) =>
              exam.classId === studentClassId &&
              studentSubjectIds.includes(exam.subjectId)
            )
          : exams.filter((exam: any) => exam.classId === studentClassId)
      }
    }
    
    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await db.exams.create(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    )
  }
}
