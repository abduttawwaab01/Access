import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const codes = await db.entranceExamCodes.getAll()
    return NextResponse.json(codes)
  } catch (error) {
    console.error("Error fetching entrance codes:", error)
    return NextResponse.json({ error: "Failed to fetch entrance codes" }, { status: 500 })
  }
}
