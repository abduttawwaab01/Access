"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useChat } from "@/components/chat/useChat"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { NewChatDialog } from "@/components/chat/NewChatDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, MessageSquare, AlertTriangle, Bell, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ParentCommunicationPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [tab, setTab] = useState("chat")
  const [showNewChat, setShowNewChat] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [annLoading, setAnnLoading] = useState(true)

  const {
    conversations, convLoading, activeConvId, setActiveConvId,
    messages, msgLoading, sendMessage, createConversation,
  } = useChat("parent")

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const otherName = activeConv?.others?.[0]?.name || ""

  useEffect(() => {
    fetch("/api/announcements").then((r) => r.json()).then((data) => {
      setAnnouncements(data.filter((a: any) => a.audience === "all" || a.audience === "parents"))
    }).catch(() => {}).finally(() => setAnnLoading(false))
  }, [])

  const priorityIcon: Record<string, any> = { high: AlertTriangle, normal: Bell, low: Info }
  const priorityColor: Record<string, string> = {
    high: "text-danger bg-danger/10 border-danger/20",
    normal: "text-primary bg-primary/10 border-primary/20",
    low: "text-muted-foreground bg-muted border-border/50",
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Communication</h2>
        <p className="text-sm text-muted-foreground">Chat with teachers and view school announcements</p>
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

      {tab === "announcements" && (
        <div className="space-y-3">
          {annLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : announcements.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-medium">No announcements</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((item, i) => {
              const Icon = priorityIcon[item.priority] || Bell
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-card border-0">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className={cn("flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl", priorityColor[item.priority])}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{item.title}</p>
                            <Badge variant="outline" className={cn("shrink-0 text-[10px]", item.priority === "high" ? "border-danger/30 text-danger" : "")}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.author} &middot; {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      )}

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelect={(contactId) => createConversation([contactId])}
        role="parent"
      />
    </div>
  )
}
