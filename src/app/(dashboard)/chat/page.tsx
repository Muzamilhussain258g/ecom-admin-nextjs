"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

import { useUserStore } from "@/features/auth/store/use-user-store"
import { Chat } from "./components/chat"
import {
  getAccessToken,
  getAccessTokenUserId,
  getBackendOrigin,
  getChatHistory,
  getChatInbox,
  markChatRead,
  sendChatMessage,
  type ChatMessage,
  type ChatSummary,
  type ChatAck,
} from "./chat-api"
import { type Conversation, type Message, type User } from "./use-chat"

function summaryToConversation(summary: ChatSummary): Conversation {
  return {
    id: String(summary.id),
    type: "direct",
    participants: [String(summary.userId)],
    name: summary.user?.name ?? `Customer ${summary.userId}`,
    avatar: "",
    lastMessage: {
      id: summary.lastMessage?.id ? String(summary.lastMessage.id) : "",
      content:
        summary.lastMessage?.text ??
        (summary.lastMessage?.attachments.length ? "Sent an attachment" : "No messages"),
      timestamp:
        summary.lastMessage?.createdAt ??
        summary.updatedAt ??
        summary.createdAt,
      senderId: summary.lastMessage ? String(summary.lastMessage.senderId) : "",
    },
    unreadCount: summary.unreadCount,
    isPinned: false,
    isMuted: false,
  }
}

function messageToUi(message: ChatMessage): Message {
  return {
    id: String(message.id),
    sequence: message.sequence,
    clientMessageId: message.clientMessageId,
    content: message.text ?? (message.attachments.length ? "Attachment" : ""),
    timestamp: message.createdAt,
    senderId: String(message.senderId),
    senderRole: message.sender.role,
    isOwn: message.sender.role === "admin",
    type: "text",
    isEdited: false,
    reactions: [],
    replyTo: null,
  }
}

export default function ChatPage() {
  const currentUser = useUserStore((state) => state.user)
  const [tokenUserId] = useState(() => getAccessTokenUserId())
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [users, setUsers] = useState<User[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const joinedConversationRef = useRef<number | null>(null)
  const selectedRef = useRef<number | null>(null)
  const messagesRef = useRef<Record<string, Message[]>>({})
  const previousSelectedRef = useRef<number | null>(null)

  useEffect(() => {
    selectedRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const refreshInbox = useCallback(async () => {
    const inbox = await getChatInbox(1, 100)
    setConversations(inbox.items.map(summaryToConversation))
    setUsers(
      inbox.items
        .filter((summary) => summary.user)
        .map((summary) => ({
          id: String(summary.userId),
          name: summary.user?.name ?? `Customer ${summary.userId}`,
          email: "",
          avatar: "",
          status: "offline",
          lastSeen: summary.updatedAt,
          role: "customer",
          department: "",
        })),
    )
  }, [])

  const catchUp = useCallback(async (conversationId: number) => {
    const current = messagesRef.current[String(conversationId)] ?? []
    const after = current.reduce(
      (highest, message) => Math.max(highest, message.sequence ?? 0),
      0,
    )
    const history = await getChatHistory(conversationId, {
      afterSequence: after,
      limit: 100,
    })
    setMessages((previous) => {
      const existing = previous[String(conversationId)] ?? []
      const byId = new Map(existing.map((message) => [message.id, message]))
      history.items.forEach((item) =>
        byId.set(String(item.id), messageToUi(item)),
      )
      return {
        ...previous,
        [String(conversationId)]: [...byId.values()].sort(
          (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0),
        ),
      }
    })
    const last = history.items.at(-1)
    if (last) await markChatRead(conversationId, last.sequence)
  }, [])

  useEffect(() => {
    void Promise.resolve()
      .then(refreshInbox)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Failed to load conversations"),
      )
      .finally(() => setLoading(false))
  }, [refreshInbox])

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    const socket = io(`${getBackendOrigin()}/chat`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    })
    socketRef.current = socket

    socket.on("message:created", (message: ChatMessage) => {
      setMessages((previous) => {
        const conversationId = String(message.conversationId)
        const existing = previous[conversationId] ?? []
        if (
          existing.some(
            (item) =>
              item.id === String(message.id) ||
              item.clientMessageId === message.clientMessageId,
          )
        ) {
          return previous
        }
        return {
          ...previous,
          [conversationId]: [...existing, messageToUi(message)].sort(
            (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0),
          ),
        }
      })
    })

    socket.on("conversation:updated", () => {
      void refreshInbox()
    })

    socket.on("conversation:read", () => {
      void refreshInbox()
    })

    socket.on(
      "typing:changed",
      (payload: {
        conversationId: number
        userId: number
        typing: boolean
        expiresAt: string | null
      }) => {
        window.dispatchEvent(
          new CustomEvent("support-chat:typing", {
            detail: payload,
          }),
        )
      },
    )

    socket.on("connect", async () => {
      joinedConversationRef.current = null
      await refreshInbox()
      if (selectedRef.current) {
        const conversationId = selectedRef.current
        try {
          const ack = (await socket
            .timeout(10000)
            .emitWithAck("conversation:join", {
              conversationId,
            })) as ChatAck<ChatSummary> | null
          if (ack?.success && selectedRef.current === conversationId) {
            joinedConversationRef.current = conversationId
            await catchUp(conversationId)
          }
        } catch {
          joinedConversationRef.current = null
        }
      }
    })

    socket.on("disconnect", () => {
      joinedConversationRef.current = null
    })

    const refreshOnFocus = () => void refreshInbox()
    window.addEventListener("focus", refreshOnFocus)

    return () => {
      window.removeEventListener("focus", refreshOnFocus)
      socket.disconnect()
      socketRef.current = null
    }
  }, [catchUp, refreshInbox])

  useEffect(() => {
    if (!selectedId) return
    const socket = socketRef.current
    const previousConversationId = previousSelectedRef.current
    previousSelectedRef.current = selectedId
    if (previousConversationId !== selectedId) {
      joinedConversationRef.current = null
    }

    void (async () => {
      try {
        const history = await getChatHistory(selectedId, { limit: 50 })
        setMessages((previous) => ({
          ...previous,
          [String(selectedId)]: history.items.map(messageToUi),
        }))
        if (history.items.length) {
          await markChatRead(
            selectedId,
            history.items.at(-1)?.sequence ?? 0,
          )
        }
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Failed to load messages",
        )
      }
    })()

    void (async () => {
      if (!socket?.connected) return
      try {
        if (previousConversationId && previousConversationId !== selectedId) {
          await socket
            .timeout(10000)
            .emitWithAck("conversation:leave", {
              conversationId: previousConversationId,
            })
        }
        const ack = (await socket
          .timeout(10000)
          .emitWithAck("conversation:join", { conversationId: selectedId })) as
          | ChatAck<ChatSummary>
          | null
        if (ack?.success && selectedRef.current === selectedId) {
          joinedConversationRef.current = selectedId
        }
      } catch {
        joinedConversationRef.current = null
      }
    })()
  }, [selectedId])

  // useEffect(() => {
  //   if (!selectedId) return
  //   const interval = window.setInterval(
  //     () => void catchUp(selectedId),
  //     15000,
  //   )
  //   return () => window.clearInterval(interval)
  // }, [catchUp, selectedId])

  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(Number(conversationId))
  }

  const handleTypingChange = useCallback(
    (conversationId: string, typing: boolean) => {
      const id = Number(conversationId)
      const socket = socketRef.current
      if (
        !Number.isInteger(id) ||
        id < 1 ||
        !socket?.connected ||
        joinedConversationRef.current !== id
      ) {
        return
      }
      socket.emit("typing:set", { conversationId: id, typing })
    },
    [],
  )

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return
    const socket = socketRef.current
    const payload = {
      conversationId: selectedId,
      clientMessageId: crypto.randomUUID(),
      text: content,
      attachmentIds: [],
    }

    if (socket?.connected) {
      const ack = (await socket
        .timeout(10000)
        .emitWithAck("message:send", payload)) as ChatAck<ChatMessage>
      if (!ack.success) {
        throw new Error(
          typeof ack.error?.message === "string"
            ? ack.error.message
            : "Could not send message",
        )
      }
      return
    }

    await sendChatMessage(selectedId, payload)
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading support conversations...
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6">
      {error && (
        <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <Chat
        conversations={conversations}
        messages={messages}
        users={users}
        currentUserId={currentUser?.id ?? tokenUserId ?? undefined}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
      />
    </div>
  )
}
