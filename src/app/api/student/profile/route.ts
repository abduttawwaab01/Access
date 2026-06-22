import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "student-1"
    const user = store.students.getById(userId)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: "student"
    })
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.id || "student-1"
    
    const updated = store.students.update(userId, {
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
      role: "student"
    })
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}