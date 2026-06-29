import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const item = await db.sessions.getById(id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const terms = await db.terms.getAll(id)
  return NextResponse.json({ ...item, termCount: terms.length })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can update sessions" }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length === 0)) {
    return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 })
  }
  const item = await db.sessions.update(id, body)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const terms = await db.terms.getAll(item.id)
  return NextResponse.json({ ...item, termCount: terms.length })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can delete sessions" }, { status: 403 })
  const { id } = await params
  const ok = await db.sessions.delete(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
