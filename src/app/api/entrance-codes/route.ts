import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  try {
    const codes = await db.entranceExamCodes.getAll()
    return NextResponse.json(codes)
  } catch (error) {
    console.error("Error fetching entrance codes:", error)
    return NextResponse.json({ error: "Failed to fetch entrance codes" }, { status: 500 })
  }
}
