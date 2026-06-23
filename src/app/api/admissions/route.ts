import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET() {
  return NextResponse.json(await db.admissionApplications.getAll())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const app = await db.admissionApplications.create(body)
  return NextResponse.json(app, { status: 201 })
}
