import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  return NextResponse.json(await db.sessions.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.sessions.create(body)
  return NextResponse.json(item, { status: 201 })
}
