import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const announcements = await db.announcements.getAll()
    const count = announcements.length
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching notification count:", error)
    return NextResponse.json({ count: 0 })
  }
}