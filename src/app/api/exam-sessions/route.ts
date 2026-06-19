import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const examId = searchParams.get("examId") || undefined
  return NextResponse.json(store.examSessions.getAll(examId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.examSessions.create(body)
  return NextResponse.json(item, { status: 201 })
}
