import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "stf_1001"
    let user = await db.staff.getById(userId)
    
    if (!user) {
      const allStaff = await db.staff.getAll()
      user = allStaff.find((s: any) => s.role === "teacher") || null
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "teacher"
    })
  } catch (error) {
    console.error("Error fetching teacher profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.id || "stf_1001"
    
    let current = await db.staff.getById(userId)
    if (!current) {
      const allStaff = await db.staff.getAll()
      current = allStaff.find((s: any) => s.role === "teacher") || null
    }
    const targetId = current?.id || userId
    
    const updated = await db.staff.update(targetId, {
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
      role: updated.role || "teacher"
    })
  } catch (error) {
    console.error("Error updating teacher profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}