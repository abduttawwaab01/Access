import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const examId = searchParams.get("examId") || undefined
  return NextResponse.json(await db.examSessions.getAll(examId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.examSessions.create(body)
  return NextResponse.json(item, { status: 201 })
}
