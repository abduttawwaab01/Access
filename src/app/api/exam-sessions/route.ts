import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const examId = searchParams.get("examId") || undefined
  const examType = searchParams.get("examType") || undefined
  let sessions = store.examSessions.getAll(examId)
  if (examType) {
    sessions = sessions.filter((s: any) => s.examType === examType)
  }
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.examSessions.create(body)
  return NextResponse.json(item, { status: 201 })
}
