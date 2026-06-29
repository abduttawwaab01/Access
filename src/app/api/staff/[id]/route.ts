import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { requireAuth } from "@/lib/api-auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const item = await db.staff.getById(id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const body = await request.json()
  const item = await db.staff.update(id, body)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (body.role) {
    const staffUserId = (item as any).userId
    if (staffUserId) {
      await prisma.user.update({ where: { id: staffUserId }, data: { role: body.role } })
    }
  }

  if (body.password) {
    const hashed = await bcrypt.hash(body.password, 10)
    const staffUserId = (item as any).userId
    if (staffUserId) {
      await prisma.user.update({ where: { id: staffUserId }, data: { password: hashed } })
    } else if (item.email) {
      const existing = await db.users.getByEmail(item.email)
      if (existing) {
        await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } })
        await db.staff.update(id, { userId: existing.id })
      } else {
        const schoolId = item.schoolId
        const user = await prisma.user.create({
          data: {
            name: `${item.firstName} ${item.lastName}`,
            email: item.email,
            password: hashed,
            role: item.user?.role || "teacher",
            schoolId,
          },
        })
        await db.staff.update(id, { userId: user.id })
      }
    }
  }

  return NextResponse.json(item)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const ok = await db.staff.delete(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
