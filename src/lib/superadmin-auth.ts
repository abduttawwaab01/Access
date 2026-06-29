import bcrypt from "bcryptjs"

export async function hashSuperAdminPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifySuperAdminPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

import crypto from "crypto"

export function createSuperAdminToken(): string {
  const secret = process.env.SUPERADMIN_SECRET || 'skoolar-superadmin-secret-change-in-production'
  
  const header = { alg: "HS256", typ: "JWT" }
  const payload = {
    role: "superadmin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000)
  }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifySuperAdminToken(token: string): { role: string; iat: number; exp: number } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const [encodedHeader, encodedPayload, signature] = parts
    const secret = process.env.SUPERADMIN_SECRET || 'skoolar-superadmin-secret-change-in-production'
    const expectedSignature = crypto.createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url")
    if (signature !== expectedSignature) return null
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString())
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    if (payload.role !== "superadmin") return null
    return payload
  } catch {
    return null
  }
}

export function extractSuperAdminToken(body: Record<string, unknown>): string | null {
  const token = body?.token
  if (typeof token !== "string") return null
  const payload = verifySuperAdminToken(token)
  return payload ? token : null
}

export function isSuperAdminAuthorized(body: Record<string, unknown>): boolean {
  return extractSuperAdminToken(body) !== null
}
