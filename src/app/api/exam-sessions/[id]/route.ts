import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await db.examSessions.getById(id)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching exam session:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam session" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const item = await db.examSessions.update(id, body)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating exam session:", error)
    return NextResponse.json(
      { error: "Failed to update exam session" },
      { status: 500 }
    )
  }
}
