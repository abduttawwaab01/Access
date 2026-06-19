import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  return NextResponse.json(store.bankDetails.get())
}

export async function PUT(request: Request) {
  const body = await request.json()
  const updated = store.bankDetails.update(body)
  return NextResponse.json(updated)
}
