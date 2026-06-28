import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId") || undefined
  const studentIds = searchParams.get("studentIds") || undefined
  const type = searchParams.get("type") || undefined
  if (type) return NextResponse.json(await db.documents.getByType(type))
  const ids = studentIds ? studentIds.split(",").filter(Boolean) : studentId ? [studentId] : undefined
  if (ids) {
    const all = await Promise.all(ids.map((id: string) => db.documents.getAll(id)))
    return NextResponse.json(all.flat())
  }
  return NextResponse.json(await db.documents.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.documents.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  const updated = await db.documents.update(id, data)
  if (!updated) return NextResponse.json({ error: "Document not found" }, { status: 404 })
  return NextResponse.json(updated)
}
