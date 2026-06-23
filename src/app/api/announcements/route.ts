import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const audience = searchParams.get("audience")
  const data = await db.announcements.getAll()
  const filtered = audience && audience !== "all"
    ? data.filter((a: any) => a.audience === audience || a.audience === "all")
    : data
  return NextResponse.json(filtered)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.announcements.create({ ...body, source: body.source || "regular" })
  return NextResponse.json(item, { status: 201 })
}
