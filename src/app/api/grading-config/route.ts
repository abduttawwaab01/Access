import { NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  const config = await db.gradingConfig.get()
  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const config = await db.gradingConfig.update(body)
  return NextResponse.json(config)
}
