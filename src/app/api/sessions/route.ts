import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const schoolId = searchParams.get("schoolId") || undefined
  const items = await db.sessions.getAll(schoolId)
  const withTermCount = await Promise.all(items.map(async (s: any) => {
    const terms = await db.terms.getAll(s.id)
    return { ...s, termCount: terms.length }
  }))
  return NextResponse.json(withTermCount)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const user = auth.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Only admins can create sessions" }, { status: 403 })
  const body = await request.json()
  if (!body.name || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "name, startDate, and endDate are required" }, { status: 400 })
  }
  const item = await db.sessions.create(body)
  return NextResponse.json(item, { status: 201 })
}
