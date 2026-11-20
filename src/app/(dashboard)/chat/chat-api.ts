"use client"

import { apiClient } from "@/lib/api/axios"

export interface ChatAttachment {
  id: string
  resourceType: "image" | "video"
  format: string
  bytes: number
  width: number | null
  height: number | null
  duration: number | null
}

export interface ChatMessage {
  id: number
  conversationId: number
  senderId: number
  clientMessageId: string
  sequence: number
  text: string | null
  createdAt: string
  sender: {
    id: number
    name: string
    role: string
  }
  attachments: ChatAttachment[]
}

export interface ChatSummary {
  id: number
  userId: number
  lastSequence: number
  createdAt: string
  updatedAt: string
  user: { id: number; name: string } | null
  readSequence: number
  readPositions: Array<{ userId: number; sequence: number }>
  unreadCount: number
  lastMessage: ChatMessage | null
}

export interface ChatInbox {
  items: ChatSummary[]
  total: number
  page: number
  limit: number
}

export interface ChatHistory {
  items: ChatMessage[]
  hasMore: boolean
  nextCursor: number | null
}

interface Ack<T> {
  success: boolean
  data?: T
  error?: { statusCode: number; message: unknown }
}

function unwrap<T>(response: unknown): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return (response as { data: T }).data
  }
  return response as T
}

export async function getChatInbox(page = 1, limit = 100) {
  const response = await apiClient.get("/chat/conversations", {
    params: { page, limit },
  })
  return unwrap<ChatInbox>(response)
}

export async function getChatHistory(
  conversationId: number,
  options: { afterSequence?: number; beforeSequence?: number; limit?: number } = {},
) {
  const response = await apiClient.get(
    `/chat/conversations/${conversationId}/messages`,
    { params: { limit: options.limit ?? 50, ...options } },
  )
  return unwrap<ChatHistory>(response)
}

export async function sendChatMessage(
  conversationId: number,
  payload: {
    clientMessageId: string
    text?: string
    attachmentIds?: string[]
  },
) {
  const response = await apiClient.post(
    `/chat/conversations/${conversationId}/messages`,
    payload,
  )
  return unwrap<ChatMessage>(response)
}

export async function markChatRead(conversationId: number, sequence: number) {
  const response = await apiClient.put(
    `/chat/conversations/${conversationId}/read`,
    { sequence },
  )
  return unwrap<{ conversationId: number; userId: number; sequence: number }>(
    response,
  )
}

export function getBackendOrigin() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured")
  return apiBase.replace(/\/api\/v1\/?$/, "")
}

export function getAccessToken() {
  if (typeof document === "undefined") return null
  return (
    document.cookie
      .split("; ")
      .find((item) => item.startsWith("_at="))
      ?.slice("_at=".length) ?? null
  )
}

export function getAccessTokenUserId() {
  const token = getAccessToken()
  if (!token) return null

  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(
      decodeURIComponent(
        Array.from(atob(normalized), (character) =>
          `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
        ).join(""),
      ),
    ) as { sub?: number | string }
    const id = Number(decoded.sub)
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

export type ChatAck<T> = Ack<T>
