import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  const config = store.gradingConfig.get()
  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const config = store.gradingConfig.update(body)
  return NextResponse.json(config)
}
