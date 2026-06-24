import { useState, useRef, useEffect } from "react"
import { MessageData } from "./useChat"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { Loader2, MessageCircle } from "lucide-react"

interface Props {
  messages: MessageData[]
  currentUserId: string
  conversationId: string | null
  onSend: (content: string) => Promise<void>
  loading?: boolean
  otherUserName?: string
}

export function ChatWindow({ messages, currentUserId, conversationId, onSend, loading, otherUserName }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  const handleSend = async (content: string) => {
    setSending(true)
    try { await onSend(content) } catch {}
    setSending(false)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-xs text-muted-foreground">No messages yet. Send your first message!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} disabled={sending} />
    </>
  )
}
