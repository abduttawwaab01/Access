import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") || undefined
  const schoolId = searchParams.get("schoolId") || undefined
  return NextResponse.json(await db.terms.getAll(sessionId, schoolId))
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can create terms" }, { status: 403 })
  const body = await request.json()
  if (!body.name || !body.sessionId) return NextResponse.json({ error: "name and sessionId are required" }, { status: 400 })
  const item = await db.terms.create(body)
  return NextResponse.json(item, { status: 201 })
}
