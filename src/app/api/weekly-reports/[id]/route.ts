import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const item = await db.weeklyReports.getById(id)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  const body = await request.json()
  // Only allow valid fields to be updated
  const allowed = ["content", "status", "publishedAt"]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key]
  }
  const item = await db.weeklyReports.update(id, update)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  // Only admins and teachers can delete reports
  if (user.role !== "admin" && user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { id } = await params
  const ok = await db.weeklyReports.delete(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
