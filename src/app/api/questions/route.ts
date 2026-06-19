import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  const classId = searchParams.get("classId") || undefined
  return NextResponse.json(store.questions.getAll(subjectId, classId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.questions.create(body)
  return NextResponse.json(item, { status: 201 })
}
