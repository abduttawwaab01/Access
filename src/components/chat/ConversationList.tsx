import { ConversationSummary } from "./useChat"
import { MessageCircle, CheckCheck } from "lucide-react"

interface Props {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  currentUserId: string
  loading?: boolean
}

function getDisplayName(conv: ConversationSummary, currentUserId: string): string {
  if (conv.others.length === 0) return "Unknown"
  if (conv.others.length === 1) return conv.others[0].name
  return conv.others.map((o) => o.name.split(" ")[0]).join(", ")
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
}

function avatarColor(id: string): string {
  const colors = ["bg-primary", "bg-secondary", "bg-amber-500", "bg-emerald-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500"]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function ConversationList({ conversations, activeId, onSelect, onNewChat, currentUserId, loading }: Props) {
  return (
    <>
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Messages</h3>
        <button onClick={onNewChat} className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="New Chat">
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">{[1,2,3,4,5].map((i) => <div key={i} className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-muted animate-pulse" /><div className="flex-1 space-y-1.5"><div className="h-3 w-24 bg-muted animate-pulse rounded" /><div className="h-2.5 w-32 bg-muted animate-pulse rounded" /></div></div>)}</div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
            <button onClick={onNewChat} className="mt-2 text-xs text-primary hover:underline">Start a chat</button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId
            const displayName = getDisplayName(conv, currentUserId)
            return (
              <button key={conv.id} onClick={() => onSelect(conv.id)} className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors hover:bg-muted/50 ${isActive ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"}`}>
                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-semibold ${avatarColor(conv.id)}`}>
                  {getInitials(displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    {conv.lastMsg && <span className="text-[10px] text-muted-foreground shrink-0">{new Date(conv.lastMsg.createdAt).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMsg ? conv.lastMsg.content : "No messages yet"}</p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 flex items-center justify-center h-5 min-w-5 rounded-full bg-primary text-[10px] font-bold text-white px-1">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </>
  )
}
