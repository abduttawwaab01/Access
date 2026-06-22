import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    const userId = request.nextUrl.searchParams.get("userId") || "1"
    let user = store.staff.getById(userId)
    
    if (!user) {
      user = store.staff.getAll().find((s: any) => s.role === "admin")
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "admin"
    })
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.id || "1"
    
    let current = store.staff.getById(userId)
    if (!current) {
      current = store.staff.getAll().find((s: any) => s.role === "admin")
    }
    const targetId = current?.id || userId
    
    const updated = store.staff.update(targetId, {
      firstName: body.name?.split(" ")[0] || "",
      lastName: body.name?.split(" ").slice(1).join(" ") || "",
      email: body.email,
      phone: body.phone
    })
    
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      id: updated.id,
      name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim(),
      email: updated.email || "",
      phone: updated.phone || "",
      role: updated.role || "admin"
    })
  } catch (error) {
    console.error("Error updating admin profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}