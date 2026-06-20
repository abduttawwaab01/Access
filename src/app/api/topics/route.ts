import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId") || undefined
  return NextResponse.json(store.topics.getAll(subjectId))
}
