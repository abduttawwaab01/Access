import { ReactNode } from "react"

interface Props {
  sidebar: ReactNode
  children: ReactNode
}

export function ChatLayout({ sidebar, children }: Props) {
  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border/50 overflow-hidden bg-background">
      <div className="w-80 shrink-0 border-r border-border/50 hidden md:flex flex-col bg-muted/20">
        {sidebar}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
