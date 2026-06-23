import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") || undefined
  return NextResponse.json(await db.terms.getAll(sessionId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.terms.create(body)
  return NextResponse.json(item, { status: 201 })
}
