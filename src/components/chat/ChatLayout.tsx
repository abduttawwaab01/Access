import { ReactNode } from "react"
import { MessageCircle } from "lucide-react"

interface Props {
  sidebar: ReactNode
  children: ReactNode
  onNewChat?: () => void
}

export function ChatLayout({ sidebar, children, onNewChat }: Props) {
  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border/50 overflow-hidden bg-background">
      <div className="w-80 shrink-0 border-r border-border/50 hidden md:flex flex-col bg-muted/20">
        {sidebar}
      </div>
      <div className="flex-1 flex flex-col min-w-0 relative">
        {children}
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="md:hidden fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
            title="New Chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  )
}
