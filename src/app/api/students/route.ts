import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const userId = searchParams.get("userId") || undefined
  
  if (userId) {
    const student = await db.students.getByUserId(userId)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    return NextResponse.json(student)
  }
  
  const data = await db.students.getAll(classId)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.students.create(body)

  if (body.email && body.password) {
    const existingUser = await db.users.getByEmail(body.email)
    if (!existingUser) {
      const schoolId = item.schoolId
      const hashed = await bcrypt.hash(body.password, 10)
      const user = await prisma.user.create({
        data: {
          name: `${body.firstName} ${body.lastName}`,
          email: body.email,
          password: hashed,
          role: "student",
          schoolId,
        },
      })
      await prisma.student.update({ where: { id: item.id }, data: { userId: user.id } })
    }
  }

  return NextResponse.json(item, { status: 201 })
}
