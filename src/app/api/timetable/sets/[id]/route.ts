import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = store.timetableSets.getById(id)
  if (!item) return NextResponse.json({ error: "Timetable set not found" }, { status: 404 })
  const entries = store.timetable.getBySet(id)
  return NextResponse.json({ ...item, entries })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const item = store.timetableSets.update(id, body)
  if (!item) return NextResponse.json({ error: "Timetable set not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = store.timetableSets.delete(id)
  if (!ok) return NextResponse.json({ error: "Timetable set not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
