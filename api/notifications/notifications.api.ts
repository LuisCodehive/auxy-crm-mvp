import { http } from "../https"
import type { Notification } from "@/types"

export function createNotification(notification: Notification) {
  return http<void>("/notifications", {
    method: "POST",
    body: JSON.stringify(notification)
  })
}

export function getNotificationById(id: string) {
  return http<Notification>(`/notifications/${id}`)
}

export function updateNotification(
  id: string,
  data: Partial<Notification>
) {
  return http<void>(`/notifications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function getAllNotifications() {
  return http<Notification[]>("/notifications")
}

export function deleteNotifications(id: string) {
  return http<void>(`/notifications/${id}`, {
    method: "DELETE"
  })
}
