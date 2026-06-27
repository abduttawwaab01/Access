"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Sparkles, StopCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface QuickAction {
  label: string
  prompt: string
}

interface AIAssistantProps {
  role: "admin" | "teacher" | "superadmin"
  teacherId?: string
  quickActions?: QuickAction[]
  placeholder?: string
}

export default function AIAssistant({
  role,
  teacherId,
  quickActions = [],
  placeholder = "Ask me anything about the school...",
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your ${role === "admin" ? "administrative" : "teaching"} AI assistant. How can I help you today?`,
    },
  ])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streaming, scrollToBottom])

  const stopStreaming = () => {
    abortController?.abort()
    setStreaming(false)
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || streaming) return

    const userMessage: Message = { role: "user", content: content.trim() }
    const assistantMessage: Message = { role: "assistant", content: "" }
    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
    setStreaming(true)

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content.trim(),
          role,
          teacherId,
          messages: history,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }))
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          lastMsg.content = `Error: ${err.error || "Something went wrong. Please try again."}`
          return updated
        })
        setStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        fullContent += text
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          lastMsg.content = fullContent
          return updated
        })
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          lastMsg.content = "Connection interrupted. Please try again."
          return updated
        })
      }
    }

    setStreaming(false)
    setAbortController(null)
  }

  const handleSubmit = () => {
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    setInput(el.value)
  }

  return (
    <div className="flex flex-col flex-1 rounded-2xl border bg-card overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 border border-border/40"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:bg-muted prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content || (streaming && i === messages.length - 1 ? "▊" : "")}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 shrink-0 rounded-full bg-primary flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {quickActions.length > 0 && !streaming && messages.length <= 2 && (
        <div className="px-3 md:px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {quickActions.map((qa, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(qa.prompt)}
                className="flex items-center gap-1 shrink-0 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-[11px] md:text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all whitespace-nowrap"
              >
                <Sparkles className="h-3 w-3" />
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border/40 p-3 md:p-4">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={streaming}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[160px] rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
          />
          {streaming ? (
            <Button size="icon" variant="outline" onClick={stopStreaming} className="shrink-0 h-10 w-10 rounded-xl">
              <StopCircle className="h-5 w-5 text-destructive" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="shrink-0 h-10 w-10 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
