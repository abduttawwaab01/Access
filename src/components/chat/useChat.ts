import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

export interface Contact {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
}

export interface ConversationSummary {
  id: string
  type: string
  others: Contact[]
  lastMsg: { id: string; content: string; senderId: string; createdAt: string } | null
  unread: number
  updatedAt: string
}

export interface MessageData {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  sender: Contact
}

export function useChat(role: string) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [convLoading, setConvLoading] = useState(true)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const authHeaders: Record<string, string> = {}
  if (role === "superadmin") {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sa_token")
      if (token) authHeaders["Authorization"] = `Bearer ${token}`
    }
  }

  const api = useCallback(async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...authHeaders, ...opts?.headers } })
    if (!res.ok) { const e = await res.json().catch(() => ({ error: "Request failed" })); throw new Error(e.error || "Request failed") }
    return res.json()
  }, [role])

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api("/api/chat/conversations")
      setConversations(data)
    } catch { /* silent */ }
    setConvLoading(false)
  }, [api])

  const fetchMessages = useCallback(async (convId: string) => {
    setMsgLoading(true)
    try {
      const data = await api(`/api/chat/conversations/${convId}/messages`)
      setMessages(data)
      await api(`/api/chat/conversations/${convId}/read`, { method: "PUT" }).catch(() => {})
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, unread: 0 } : c))
    } catch { /* silent */ }
    setMsgLoading(false)
  }, [api])

  const sendMessage = useCallback(async (convId: string, content: string) => {
    const msg = await api(`/api/chat/conversations/${convId}/messages`, { method: "POST", body: JSON.stringify({ content }) })
    setMessages((prev) => [...prev, msg])
    return msg
  }, [api])

  const createConversation = useCallback(async (participantIds: string[]) => {
    const data = await api("/api/chat/conversations", { method: "POST", body: JSON.stringify({ participantIds }) })
    await fetchConversations()
    setActiveConvId(data.id)
    return data.id
  }, [api, fetchConversations])

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      fetchConversations()
      if (activeConvId) fetchMessages(activeConvId)
    }, 5000)
  }, [fetchConversations, fetchMessages, activeConvId])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  useEffect(() => {
    fetchConversations()
    startPolling()
    return stopPolling
  }, [])

  useEffect(() => {
    if (activeConvId) fetchMessages(activeConvId)
  }, [activeConvId])

  return {
    conversations, convLoading,
    activeConvId, setActiveConvId,
    messages, msgLoading,
    fetchConversations, fetchMessages,
    sendMessage, createConversation,
    stopPolling, startPolling,
    authHeaders,
  }
}
