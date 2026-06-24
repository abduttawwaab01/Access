import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/chat-auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  })
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!conv.participants.some((p: any) => p.userId === user.id) && user.role !== "superadmin" && user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" as const },
  })

  const senderIds = [...new Set(messages.map((m: any) => m.senderId))]
  const userRecords = await prisma.user.findMany({ where: { id: { in: senderIds.filter((sid: string) => sid !== "superadmin") } }, select: { id: true, name: true, email: true, role: true, image: true } })
  const userMap: Record<string, any> = {}
  for (const u of userRecords) userMap[u.id] = u
  userMap["superadmin"] = { id: "superadmin", name: "Super Admin", email: "superadmin@skoolar.com", role: "superadmin", image: null }

  const enriched = messages.map((m: any) => ({ ...m, sender: userMap[m.senderId] || { id: m.senderId, name: m.senderId, role: "unknown" } }))

  return NextResponse.json(enriched)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  })
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!conv.participants.some((p: any) => p.userId === user.id) && user.role !== "superadmin" && user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 })

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, content: content.trim() },
  })

  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } })

  const enriched = { ...message, sender: { id: user.id, name: user.name, role: user.role, image: user.image } }

  return NextResponse.json(enriched)
}
