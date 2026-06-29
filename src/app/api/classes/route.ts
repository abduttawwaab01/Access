import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get("schoolId") || undefined
  return NextResponse.json(await db.classes.getAll(schoolId))
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can create classes" }, { status: 403 })
  const body = await request.json()
  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 })
  if (typeof body.name !== "string" || body.name.trim().length === 0) return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 })
  const item = await db.classes.create(body)
  return NextResponse.json(item, { status: 201 })
}
