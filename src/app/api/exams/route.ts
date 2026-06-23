import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  const type = searchParams.get("type") || undefined
  return NextResponse.json(await db.exams.getAll(subjectId, classId, type))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.exams.create(body)
  return NextResponse.json(item, { status: 201 })
}
