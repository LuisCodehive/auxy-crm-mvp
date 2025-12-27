import { http } from "../https"
import type { ChatMessage } from "@/types"

export function createChatMessage(client: ChatMessage) {
  return http<void>("/chatMessages", {
    method: "POST",
    body: JSON.stringify(client)
  })
}

export function getChatMessageById(id: string) {
  return http<ChatMessage>(`/chatMessages/${id}`)
}

export function updateChatMessage(
  id: string,
  data: Partial<ChatMessage>
) {
  return http<void>(`/chatMessages/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function getAllChatMessages() {
  return http<ChatMessage[]>("/chatMessages")
}

export function deleteChatMessage(id: string) {
  return http<void>(`/chatMessages/${id}`, {
    method: "DELETE"
  })
}