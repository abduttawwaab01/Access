import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function currentSession(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  if (month >= 8) return `${year}/${year + 1}`
  return `${year - 1}/${year}`
}

export async function getCurrentSessionFromDb(schoolId?: string): Promise<{ id: string; name: string } | null> {
  try {
    const where: any = { isCurrent: true }
    if (schoolId) where.schoolId = schoolId
    const { prisma } = await import("@/lib/prisma")
    const session = await prisma.academicSession.findFirst({ where, select: { id: true, name: true } })
    return session
  } catch { return null }
}

export async function getCurrentTermFromDb(sessionId?: string): Promise<{ id: string; name: string } | null> {
  try {
    const where: any = { isCurrent: true }
    if (sessionId) where.sessionId = sessionId
    const { prisma } = await import("@/lib/prisma")
    const term = await prisma.term.findFirst({ where, select: { id: true, name: true } })
    return term
  } catch { return null }
}
