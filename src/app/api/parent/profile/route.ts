import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "par_1001"
    let user = await db.users.getById(userId)
    
    if (!user) {
      const users = await db.users.getAll("parent")
      user = users[0]
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: "parent"
    })
  } catch (error) {
    console.error("Error fetching parent profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.id || "par_1001"
    
    let current = await db.users.getById(userId)
    if (!current) {
      const users = await db.users.getAll("parent")
      current = users[0]
    }
    const targetId = current?.id || userId
    
    const updated = await db.users.update(targetId, {
      name: body.name || current?.name || "",
      email: body.email,
      phone: body.phone
    })
    
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      id: updated.id,
      name: updated.name || "",
      email: updated.email || "",
      phone: updated.phone || "",
      role: "parent"
    })
  } catch (error) {
    console.error("Error updating parent profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}