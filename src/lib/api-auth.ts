import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return session
}

/**
 * Requires authentication AND a specific role.
 * Returns the session if authorized, or a 401/403 response.
 */
export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userRole = (session.user as any).role as UserRole
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
  }
  return session
}

/**
 * Extracts the authenticated user's ID from the session.
 */
export function getUserId(session: any): string | null {
  return (session?.user as any)?.id || null
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
