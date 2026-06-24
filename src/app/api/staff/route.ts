import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  return NextResponse.json(await db.staff.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.staff.create(body)

  if (body.email) {
    const existingUser = await db.users.getByEmail(body.email)
    const schoolId = item.schoolId
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

  return NextResponse.json(item, { status: 201 })
}
