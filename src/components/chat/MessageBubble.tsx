import { MessageData } from "./useChat"

interface Props {
  message: MessageData
  isOwn: boolean
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
}

const avatarColors = ["bg-primary", "bg-secondary", "bg-amber-500", "bg-emerald-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500"]

function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function MessageBubble({ message, isOwn }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const senderName = message.sender?.name || message.senderId
  const initials = getInitials(senderName)

  return (
    <div className={`flex items-start gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-semibold ${avatarColor(message.senderId)}`}>
        {initials}
      </div>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isOwn ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-muted rounded-tl-md"}`}>
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5 px-1">{time}</span>
      </div>
    </div>
  )
}
