import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, token, categories } = body

  if (token !== "superadmin-authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  if (action === "get-counts") {
    const counts = await db.dangerZone.getCounts()
    return NextResponse.json({ success: true, data: counts })
  }

  if (action === "delete") {
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ success: false, error: "No categories selected" })
    }
    const result = await db.dangerZone.deleteAll(categories)
    return NextResponse.json(result)
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
}
