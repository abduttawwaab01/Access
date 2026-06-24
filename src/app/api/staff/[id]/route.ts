import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.staff.getById(id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const item = await db.staff.update(id, body)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (body.password && item.email) {
    const hashed = await bcrypt.hash(body.password, 10)
    const existing = await db.users.getByEmail(item.email)
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } })
    } else {
      const schoolId = item.schoolId
      await prisma.user.create({
        data: {
          name: `${item.firstName} ${item.lastName}`,
          email: item.email,
          password: hashed,
          role: item.role === "admin" ? "admin" : "teacher",
          schoolId,
        },
      })
    }
  }

  return NextResponse.json(item)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await db.staff.delete(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
