"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useChat } from "@/components/chat/useChat"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { NewChatDialog } from "@/components/chat/NewChatDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, Bell, Megaphone, AlertTriangle, Info, MessageSquare, X } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSheet } from "@/components/admin/FormSheet"
import { EmptyState } from "@/components/admin/EmptyState"
import { cn } from "@/lib/utils"

export default function TeacherCommunicationPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id || ""
  const [tab, setTab] = useState("chat")
  const [showNewChat, setShowNewChat] = useState(false)
  const [announceTab, setAnnounceTab] = useState("all")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", audience: "teachers", priority: "normal" })

  const {
    conversations, convLoading, activeConvId, setActiveConvId,
    messages, msgLoading, sendMessage, createConversation,
  } = useChat("teacher")

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const otherName = activeConv?.others?.[0]?.name || ""

  const fetchItems = async () => {
    const res = await fetch("/api/announcements")
    setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const update = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, author: "You" }) })
    if (res.ok) { toast.success("Announcement sent"); setSheetOpen(false); fetchItems() }
    else toast.error("Failed to send")
  }

  const filtered = items.filter((a) => announceTab === "all" || a.audience === announceTab)

  const priorityIcon: Record<string, any> = { high: AlertTriangle, normal: Bell, low: Info }
  const priorityColor: Record<string, string> = {
    high: "text-danger bg-danger/10 border-danger/20",
    normal: "text-primary bg-primary/10 border-primary/20",
    low: "text-muted-foreground bg-muted border-border/50",
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader title="Communication" description="Announcements and direct messaging" actionLabel="New Announcement" onAction={() => { setForm({ title: "", content: "", audience: "teachers", priority: "normal" }); setSheetOpen(true) }} />

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
        <>
          <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit overflow-x-auto">
            {["all", "teachers", "parents"].map((t) => (
              <button key={t} onClick={() => setAnnounceTab(t)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${announceTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No announcements" description="Create your first announcement" />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((item, i) => {
                  const Icon = priorityIcon[item.priority] || Bell
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="glass-card border-0">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", priorityColor[item.priority])}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold">{item.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{item.author} · {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">{item.audience}</Badge>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{item.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelect={(contactId) => createConversation([contactId])}
        role="teacher"
      />

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Staff Meeting Friday" className="h-12" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => v && update("audience", v)}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="teachers">Teachers Only</SelectItem>
                  <SelectItem value="parents">Parents Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => v && update("priority", v)}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={form.content} onChange={(e) => update("content", e.target.value)} rows={5} className="resize-none" required />
          </div>
          <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
            Send Announcement
          </Button>
        </form>
      </FormSheet>
    </div>
  )
}
