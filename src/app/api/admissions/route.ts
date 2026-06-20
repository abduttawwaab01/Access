import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  return NextResponse.json(store.admissionApplications.getAll())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const app = store.admissionApplications.create(body)
  return NextResponse.json(app, { status: 201 })
}
