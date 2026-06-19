import { NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  return NextResponse.json(store.salaryStructures.getAll())
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, staffId, ...data } = body
  if (action === "update" && staffId) {
    const item = store.salaryStructures.update(staffId, data)
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json(item)
  }
  const item = store.salaryStructures.create(body)
  return NextResponse.json(item, { status: 201 })
}
