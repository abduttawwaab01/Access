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

  if (body.email && body.password) {
    const existingUser = await db.users.getByEmail(body.email)
    if (!existingUser) {
      const schoolId = item.schoolId
      const hashed = await bcrypt.hash(body.password, 10)
      await prisma.user.create({
        data: {
          name: `${body.firstName} ${body.lastName}`,
          email: body.email,
          password: hashed,
          role: body.role === "admin" ? "admin" : "teacher",
          schoolId,
        },
      })
    }
  }

  return NextResponse.json(item, { status: 201 })
}
