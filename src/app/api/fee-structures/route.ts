import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  return NextResponse.json(await db.feeStructures.getAll(classId))
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const item = await db.feeStructures.create(body)
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const item = await db.feeStructures.update(id, data)
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const ok = await db.feeStructures.delete(id)
  return NextResponse.json({ ok })
}
