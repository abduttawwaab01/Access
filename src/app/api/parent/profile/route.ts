import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth, getUserId } from "@/lib/api-auth"

export async function GET(_request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  
  try {
    const userId = getUserId(auth)
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 })
    }
    
    let user = await db.users.getById(userId)
    
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
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  
  try {
    const userId = getUserId(auth)
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 })
    }
    
    const body = await request.json()
    
    const current = await db.users.getById(userId)
    if (!current) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Only allow updating own profile fields
    const allowedFields = ["name", "email", "phone"]
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    const updated = await db.users.update(userId, updateData)
    
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
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
