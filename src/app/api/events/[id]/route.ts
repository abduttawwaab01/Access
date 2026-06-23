import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await db.events.getById(id)
  if (!item) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const item = await db.events.update(id, body)
  if (!item) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await db.events.delete(id)
  if (!ok) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
