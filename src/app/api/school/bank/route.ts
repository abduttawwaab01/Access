import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  return NextResponse.json(await db.bankDetails.get())
}

export async function PUT(request: Request) {
  const body = await request.json()
  const updated = await db.bankDetails.update(body)
  return NextResponse.json(updated)
}
