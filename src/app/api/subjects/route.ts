import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId") || undefined
  return NextResponse.json(await db.subjects.getAll(classId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.subjects.create(body)
  return NextResponse.json(item, { status: 201 })
}
