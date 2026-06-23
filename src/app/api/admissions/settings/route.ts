import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  return NextResponse.json(store.admissionSettings.get())
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const settings = store.admissionSettings.update(body)
  return NextResponse.json(settings)
}
