import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/api-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "par_1001"
    let user = store.parents.getById(userId)
    
    if (!user) {
      user = store.parents.getAll()[0]
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
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
    
    let current = store.parents.getById(userId)
    if (!current) {
      current = store.parents.getAll()[0]
    }
    const targetId = current?.id || userId
    
    const updated = store.parents.update(targetId, {
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
      role: "parent"
    })
  } catch (error) {
    console.error("Error updating parent profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}