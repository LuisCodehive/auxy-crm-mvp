import { http } from "../https"
//import { User } from "@/interfaces"
import type { User } from "@/types"

export function createUser(user: User) {
  return http<void>("/users", {
    method: "POST",
    body: JSON.stringify(user)
  })
}

export function getUserById(id: string) {
  return http<User>(`/users/${id}`)
}

export function updateUser(id: string, data: Partial<User>) {
  return http<void>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteUser(id: string) {
  return http<void>(`/users/${id}`, {
    method: "DELETE"
  })
}

export function getAllUsers() {
  return http<User[]>("/users")
}
