"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useChat } from "@/components/chat/useChat"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { NewChatDialog } from "@/components/chat/NewChatDialog"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, MessageSquare } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"

export default function AdminCommunicationPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [tab, setTab] = useState("chat")
  const [showNewChat, setShowNewChat] = useState(false)

  const {
    conversations, convLoading, activeConvId, setActiveConvId,
    messages, msgLoading, sendMessage, createConversation,
  } = useChat("admin")

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const otherName = activeConv?.others?.[0]?.name || ""

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication</h2>
          <p className="text-sm text-muted-foreground">Direct messaging with teachers, parents, and staff</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="chat" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            <MessageSquare className="h-4 w-4 mr-1.5" /> Chat
          </TabsTrigger>
          <TabsTrigger value="announcements" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            <Megaphone className="h-4 w-4 mr-1.5" /> Announcements
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "chat" && (
        <ChatLayout
          sidebar={
            <ConversationList
              conversations={conversations}
              activeId={activeConvId}
              onSelect={setActiveConvId}
              onNewChat={() => setShowNewChat(true)}
              currentUserId={userId}
              loading={convLoading}
            />
          }
          onNewChat={() => setShowNewChat(true)}
        >
          <ChatWindow
            messages={messages}
            currentUserId={userId}
            conversationId={activeConvId}
            onSend={async (content) => { if (activeConvId) await sendMessage(activeConvId, content) }}
            loading={msgLoading}
            otherUserName={otherName}
          />
        </ChatLayout>
      )}

      {tab === "announcements" && <AnnouncementsView />}

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelect={(contactId) => createConversation([contactId])}
        role="admin"
      />
    </div>
  )
}

function AnnouncementsView() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/announcements").then((r) => r.json()).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
  if (items.length === 0) return <Card><CardContent className="p-8 text-center text-muted-foreground"><Megaphone className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No announcements</p></CardContent></Card>

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.author} &middot; {new Date(item.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
