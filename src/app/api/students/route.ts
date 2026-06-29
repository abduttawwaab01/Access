import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { requireAuth } from "@/lib/api-auth"

async function resolveStudent(userId: string) {
  let student = await db.students.getByUserId(userId)
  if (!student) student = await db.students.getById(userId)
  if (!student) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
    if (user?.email) {
      student = await prisma.student.findFirst({ where: { email: user.email } })
    }
    if (!student && user?.name) {
      const nameParts = user.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || firstName
      student = await prisma.student.findFirst({ where: { firstName, lastName } })
    }
    if (student) {
      await prisma.student.update({ where: { id: student.id }, data: { userId } })
    }
  }
  return student
}

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  const classIds = searchParams.get("classIds") || undefined
  const userId = searchParams.get("userId") || undefined
  const pageRaw = searchParams.get("page")

  if (userId) {
    const student = await resolveStudent(userId)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, cacheHeader())
    }
    return NextResponse.json(student, cacheHeader())
  }

  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10)
    const where: any = {}
    if (classId) where.classId = classId
    const result = await paginatedQuery(
      prisma.student,
      { where, include: { class: true }, orderBy: { firstName: "asc" } },
      { page, pageSize }
    )
    return NextResponse.json(result, cacheHeader())
  }

  const cids = classIds ? classIds.split(",").filter(Boolean) : classId ? [classId] : undefined
  if (cids) {
    const all = await Promise.all(cids.map((cid: string) => db.students.getAll(cid)))
    return NextResponse.json(all.flat(), cacheHeader())
  }
  const data = await db.students.getAll()
  return NextResponse.json(data, cacheHeader())
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
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