import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/chat-auth"

export async function GET(request: Request) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where = user.role === "superadmin" ? {} : user.role === "admin" ? { schoolId: user.schoolId } : {}

  const conversations = await prisma.conversation.findMany({
    where: {
      ...where,
      participants: { some: { userId: user.id } },
    },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
    },
    orderBy: { updatedAt: "desc" as const },
  })

  const userIds = [...new Set(conversations.flatMap((c: { participants: { userId: string }[] }) => c.participants.map((p: { userId: string }) => p.userId)))]
  const userRecords = await prisma.user.findMany({ where: { id: { in: userIds.filter((id: string) => id !== "superadmin") } }, select: { id: true, name: true, email: true, role: true, image: true } })
  const userMap: Record<string, any> = {}
  for (const u of userRecords) userMap[u.id] = u
  userMap["superadmin"] = { id: "superadmin", name: "Super Admin", email: "superadmin@skoolar.com", role: "superadmin", image: null }

  const withUnread = await Promise.all(conversations.map(async (c: any) => {
    const me = c.participants.find((p: any) => p.userId === user.id)
    if (!me?.lastReadAt) return { ...c, unread: c.messages.length > 0 ? 1 : 0 }
    const unread = await prisma.message.count({ where: { conversationId: c.id, createdAt: { gt: me.lastReadAt }, senderId: { not: user.id } } })
    return { ...c, unread }
  }))

  const result = withUnread.map((c: any) => {
    const others = c.participants.filter((p: any) => p.userId !== user.id).map((p: any) => userMap[p.userId] || { id: p.userId, name: p.userId, email: "", role: "unknown" }).filter((o: any) => o.role !== "student")
    const lastMsg = c.messages[0] || null
    return { id: c.id, type: c.type, others, lastMsg: lastMsg ? { id: lastMsg.id, content: lastMsg.content, senderId: lastMsg.senderId, createdAt: lastMsg.createdAt } : null, unread: c.unread, updatedAt: c.updatedAt }
  })

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { participantIds }: { participantIds: string[] } = await request.json()
  if (!participantIds?.length) return NextResponse.json({ error: "No participants" }, { status: 400 })

  const participants = await prisma.user.findMany({ where: { id: { in: participantIds } }, select: { id: true, role: true } })
  const studentParticipant = participants.find((p) => p.role === "student")
  if (studentParticipant) return NextResponse.json({ error: "Students cannot be contacted via chat" }, { status: 403 })

  const allIds = [...new Set([user.id, ...participantIds])]
  const schoolId = user.role === "superadmin" ? (await prisma.school.findFirst())?.id || "" : user.schoolId

  const existing = await prisma.conversation.findFirst({
    where: {
      schoolId,
      participants: { every: { userId: { in: allIds } } },
    },
  })
  if (existing) return NextResponse.json({ id: existing.id })

  const conversation = await prisma.conversation.create({
    data: {
      schoolId,
      participants: { create: allIds.map((userId: string) => ({ userId })) },
    },
  })

  return NextResponse.json({ id: conversation.id })
}
