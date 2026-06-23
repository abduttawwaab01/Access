import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const upcoming = searchParams.get("upcoming")
  const filters: { type?: string; upcoming?: boolean } = {}
  if (type) filters.type = type
  if (upcoming === "true") filters.upcoming = true
  const data = store.events.getAll(filters)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.events.create(body)
  return NextResponse.json(item, { status: 201 })
}
