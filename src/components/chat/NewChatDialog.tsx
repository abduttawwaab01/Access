import { useState, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Contact } from "./useChat"

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (contactId: string) => void
  role: string
}

export function NewChatDialog({ open, onClose, onSelect, role }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const authHeaders: Record<string, string> = {}
  if (role === "superadmin" && typeof window !== "undefined") {
    const token = localStorage.getItem("sa_token")
    if (token) authHeaders["Authorization"] = `Bearer ${token}`
  }

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch("/api/chat/contacts", { headers: { "Content-Type": "application/json", ...authHeaders } })
      .then((r) => r.json())
      .then((data) => setContacts(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, role])

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (id: string) => {
    onSelect(id)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold">New Conversation</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No contacts found</div>
          ) : (
            filtered.map((c) => (
              <button key={c.id} onClick={() => handleSelect(c.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-semibold ${avatarColor(c.id)}`}>
                  {getInitials(c.name)}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
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
