import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma-store"
import { requireAuth } from "@/lib/api-auth"

function findUserByEmail(email: string, allStaff: any[]) {
  return allStaff.find((s: any) => s.email?.toLowerCase() === email.toLowerCase()) || null
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const allStaff = await db.staff.getAll()
    const queryEmail = request.nextUrl.searchParams.get("email")
    let user = queryEmail ? findUserByEmail(queryEmail, allStaff) : null

    if (!user) user = allStaff.find((s: any) => s.user?.role === "admin") || allStaff[0] || null

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email || "",
      phone: user.phone || "",
      role: user.user?.role || "admin"
    })
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const body = await request.json()
    const allStaff = await db.staff.getAll()
    const queryEmail = request.nextUrl.searchParams.get("email")
    let current = queryEmail ? findUserByEmail(queryEmail, allStaff) : null
    if (!current && body.email) current = findUserByEmail(body.email, allStaff)
    const targetId = current?.id || body.id

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
      role: updated.user?.role || "admin"
    })
  } catch (error) {
    console.error("Error updating admin profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}