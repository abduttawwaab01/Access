import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { isSuperAdminAuthorized } from "@/lib/superadmin-auth"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  if (!isSuperAdminAuthorized(body)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  if (action === "get-counts") {
    const counts = await db.dangerZone.getCounts()
    return NextResponse.json({ success: true, data: counts })
  }

  if (action === "delete") {
    if (!Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json({ success: false, error: "No categories selected" })
    }
    const result = await db.dangerZone.deleteAll(body.categories)
    return NextResponse.json(result)
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
}
