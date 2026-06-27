import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function resolveStudent(userId: string) {
  let student = await db.students.getByUserId(userId)
  if (!student) student = await db.students.getById(userId)
  if (!student) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    if (user?.email) {
      student = await prisma.student.findFirst({ where: { email: user.email } })
      if (student) {
        await prisma.student.update({ where: { id: student.id }, data: { userId } })
      }
    }
  }
  return student
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const userId = searchParams.get("userId") || undefined

  if (userId) {
    const student = await resolveStudent(userId)
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

  if (body.email) {
    const existingUser = await db.users.getByEmail(body.email)
    const schoolId = item.schoolId
    if (existingUser) {
      if (body.password) {
        const hashed = await bcrypt.hash(body.password, 10)
        await prisma.user.update({ where: { id: existingUser.id }, data: { password: hashed } })
      }
      await prisma.student.update({ where: { id: item.id }, data: { userId: existingUser.id } })
    } else if (body.password) {
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