import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET() {
  return NextResponse.json(store.feedbackTickets.getAll())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const ticket = store.feedbackTickets.create(body)
  return NextResponse.json(ticket, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, subject, message, priority } = body
  const updated = store.feedbackTickets.update(id, { subject, message, priority })
  if (!updated) {
    return NextResponse.json({ success: false, error: "Ticket not found or unauthorized" }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: { ticket: updated } })
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
  }
  const success = store.feedbackTickets.delete(id)
  if (!success) {
    return NextResponse.json({ success: false, error: "Ticket not found or unauthorized" }, { status: 404 })
  }
  return NextResponse.json({ success: true, message: "Ticket deleted" })
}
