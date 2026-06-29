import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const upcoming = searchParams.get("upcoming")
  const filters: { type?: string; upcoming?: boolean } = {}
  if (type) filters.type = type
  if (upcoming === "true") filters.upcoming = true
  const data = await db.events.getAll(filters)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const item = await db.events.create(body)
  return NextResponse.json(item, { status: 201 })
}
