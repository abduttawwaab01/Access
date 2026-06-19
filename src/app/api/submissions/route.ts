import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  return NextResponse.json(store.submissions.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = store.submissions.create(body)
  return NextResponse.json(item, { status: 201 })
}
