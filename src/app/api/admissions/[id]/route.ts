import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const app = store.admissionApplications.getById(id)
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(app)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const app = store.admissionApplications.update(id, body)
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(app)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = store.admissionApplications.delete(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
