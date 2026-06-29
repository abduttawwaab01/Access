import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { requireRole } from "@/lib/api-auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("admin", "superadmin", "parent")
  if (auth instanceof Response) return auth
  const { id } = await params
  const item = await db.users.getById(id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { password, ...safeItem } = item
  return NextResponse.json(safeItem)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("admin", "superadmin", "parent")
  if (auth instanceof Response) return auth
  
  const { id } = await params
  const body = await request.json()
  
  const allowedFields = ["name", "email", "phone", "image"]
  const data: Record<string, any> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }
  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }
    data.password = await bcrypt.hash(body.password, 10)
  }
  
  const item = await db.users.update(id, data)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  
  const { password, ...safeItem } = item
  return NextResponse.json(safeItem)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole("admin", "superadmin")
  if (auth instanceof Response) return auth
  const { id } = await params
  
  await prisma.parentLink.deleteMany({ where: { parentId: id } })
  
  const ok = await db.users.delete(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
