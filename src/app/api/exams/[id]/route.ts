import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const item = await db.exams.getById(id)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  try {
    const body = await request.json()
    const item = await db.exams.update(id, body)
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const { id } = await params
  try {
    const ok = await db.exams.delete(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    )
  }
}
