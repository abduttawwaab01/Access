import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") || undefined
  return NextResponse.json(store.terms.getAll(sessionId))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.terms.create(body)
  return NextResponse.json(item, { status: 201 })
}
