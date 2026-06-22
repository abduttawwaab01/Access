import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session
    const userId = request.nextUrl.searchParams.get("userId") || "admin-1"
    const user = store.staff.getById(userId)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: "admin"
    })
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.id || "admin-1"
    
    const updated = store.staff.update(userId, {
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
      name: `${updated.firstName} ${updated.lastName}`,
      email: updated.email,
      phone: updated.phone,
      role: "admin"
    })
  } catch (error) {
    console.error("Error updating admin profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}