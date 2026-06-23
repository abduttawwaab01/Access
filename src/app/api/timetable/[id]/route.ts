import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = store.timetable.getById(id)
  if (!item) return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const item = store.timetable.update(id, body)
  if (!item) return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = store.timetable.delete(id)
  if (!ok) return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
