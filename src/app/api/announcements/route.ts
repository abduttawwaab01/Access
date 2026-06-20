import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const audience = searchParams.get("audience")
  const data = audience ? store.announcements.getByAudience(audience) : store.announcements.getAll()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.announcements.create(body)
  return NextResponse.json(item, { status: 201 })
}
