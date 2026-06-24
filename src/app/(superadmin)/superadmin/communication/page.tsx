"use client"

import { useState } from "react"
import { useChat } from "@/components/chat/useChat"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { NewChatDialog } from "@/components/chat/NewChatDialog"

export default function SuperAdminCommunicationPage() {
  const [showNewChat, setShowNewChat] = useState(false)

  const {
    conversations, convLoading, activeConvId, setActiveConvId,
    messages, msgLoading, sendMessage, createConversation,
  } = useChat("superadmin")

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const otherName = activeConv?.others?.[0]?.name || ""

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Communication</h2>
        <p className="text-sm text-zinc-400">Direct messaging across all schools</p>
      </div>

      <ChatLayout
        sidebar={
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            onSelect={setActiveConvId}
            onNewChat={() => setShowNewChat(true)}
            currentUserId="superadmin"
            loading={convLoading}
          />
        }
      >
        <ChatWindow
          messages={messages}
          currentUserId="superadmin"
          conversationId={activeConvId}
          onSend={async (content) => { if (activeConvId) await sendMessage(activeConvId, content) }}
          loading={msgLoading}
          otherUserName={otherName}
        />
      </ChatLayout>

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelect={(contactId) => createConversation([contactId])}
        role="superadmin"
      />
    </div>
  )
}
