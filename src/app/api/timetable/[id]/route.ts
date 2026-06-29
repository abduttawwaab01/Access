import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const item = await db.timetable.getById(id)
  if (!item) return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can update timetable entries" }, { status: 403 })
  }
  const { id } = await params
  const body = await request.json()
  const item = await db.timetable.update(id, body)
  if (!item) return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete timetable entries" }, { status: 403 })
  }
  const { id } = await params
  const ok = await db.timetable.delete(id)
  if (!ok) return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
