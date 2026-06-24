import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  try {
    const announcements = await db.announcements.getAll()
    const count = announcements.length
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching notification count:", error)
    return NextResponse.json({ count: 0 })
  }
}