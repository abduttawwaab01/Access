import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.students.getById(id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  try {
    const item = await db.students.update(id, body)

    if (body.password) {
      const hashed = await bcrypt.hash(body.password, 10)
      if (item.userId) {
        await prisma.user.update({ where: { id: item.userId }, data: { password: hashed } })
      } else if (item.email) {
        const existing = await db.users.getByEmail(item.email)
        if (existing) {
          await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } })
          await prisma.student.update({ where: { id: item.id }, data: { userId: existing.id } })
        } else {
          const schoolId = item.schoolId
          const user = await prisma.user.create({
            data: {
              name: `${item.firstName} ${item.lastName}`,
              email: item.email,
              password: hashed,
              role: "student",
              schoolId,
            },
          })
          await prisma.student.update({ where: { id: item.id }, data: { userId: user.id } })
        }
      }
    }

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.students.delete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
