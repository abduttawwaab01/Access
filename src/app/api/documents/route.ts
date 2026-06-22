import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId") || undefined
  const type = searchParams.get("type") || undefined
  if (type) return NextResponse.json(store.documents.getByType(type))
  return NextResponse.json(store.documents.getAll(studentId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.documents.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  const updated = store.documents.update(id, data)
  if (!updated) return NextResponse.json({ error: "Document not found" }, { status: 404 })
  return NextResponse.json(updated)
}
