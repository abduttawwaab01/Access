import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  return NextResponse.json(await db.feedbackTickets.getAll())
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const ticket = await db.feedbackTickets.create(body)
  return NextResponse.json(ticket, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const body = await request.json()
  const { id, subject, message, priority } = body
  const updated = await db.feedbackTickets.update(id, { subject, message, priority })
  if (!updated) {
    return NextResponse.json({ success: false, error: "Ticket not found or unauthorized" }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: { ticket: updated } })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
  }
  const success = await db.feedbackTickets.delete(id)
  if (!success) {
    return NextResponse.json({ success: false, error: "Ticket not found or unauthorized" }, { status: 404 })
  }
  return NextResponse.json({ success: true, message: "Ticket deleted" })
}
