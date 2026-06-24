import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"

async function resolveStaff(userId: string) {
  let staff = await db.staff.getByUserId(userId)
  if (!staff) staff = await db.staff.getById(userId)
  return staff
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || ""
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    const user = await resolveStaff(userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
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
    const id = body.id || ""
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const current = await resolveStaff(id)
    const targetId = current?.id
    if (!targetId) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const updated = await db.staff.update(targetId, {
      firstName: body.name?.split(" ")[0] || "",
      lastName: body.name?.split(" ").slice(1).join(" ") || "",
      email: body.email,
      phone: body.phone
    })
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 })
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