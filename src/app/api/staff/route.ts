import { NextResponse } from "next/server"
import { cacheHeader } from "@/lib/cache-header"
import { db, paginatedQuery } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const pageRaw = searchParams.get("page")
  if (userId) {
    const staff = await db.staff.getByUserId(userId)
    if (!staff) return NextResponse.json({ error: "Staff not found" }, cacheHeader())
    return NextResponse.json(staff, cacheHeader())
  }
  if (pageRaw) {
    const page = parseInt(pageRaw, 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10)
    const result = await paginatedQuery(prisma.staff, { orderBy: { firstName: "asc" } }, { page, pageSize })
    return NextResponse.json(result, cacheHeader())
  }
  return NextResponse.json(await db.staff.getAll(), cacheHeader())
}

export async function POST(request: Request) {
  const body = await request.json()
  const { classIds, subjectIds, isClassTeacher, ...staffData } = body
  const item = await db.staff.create(staffData)
  const schoolId = item.schoolId

  if (body.email) {
    const existingUser = await db.users.getByEmail(body.email)
    if (existingUser) {
      if (body.password) {
        const hashed = await bcrypt.hash(body.password, 10)
        await prisma.user.update({ where: { id: existingUser.id }, data: { password: hashed } })
      }
      await db.staff.update(item.id, { userId: existingUser.id })
    } else if (body.password) {
      const hashed = await bcrypt.hash(body.password, 10)
      const user = await prisma.user.create({
        data: {
          name: `${body.firstName} ${body.lastName}`,
          email: body.email,
          password: hashed,
          role: body.role === "admin" ? "admin" : "teacher",
          schoolId,
        },
      })
      await db.staff.update(item.id, { userId: user.id })
    }
  }

  if (classIds?.length || subjectIds?.length) {
    await Promise.all([
      db.teacherClasses.setAssignments(item.id, classIds || [], isClassTeacher || false),
      db.teacherSubjects.setAssignments(item.id, subjectIds || []),
    ])
  }

  return NextResponse.json(item, { status: 201 })
}
