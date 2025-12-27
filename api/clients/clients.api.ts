import { http } from "../https"
import type { Client } from "@/types"

export function createClient(client: Client) {
  return http<void>("/clients", {
    method: "POST",
    body: JSON.stringify(client)
  })
}

export function getClientById(id: string) {
  return http<Client>(`/clients/${id}`)
}

export function updateClient(
  id: string,
  data: Partial<Client>
) {
  return http<void>(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function getAllClients() {
  return http<Client[]>("/clients")
}

export function deleteClients(id: string) {
  return http<void>(`/clients/${id}`, {
    method: "DELETE"
  })
}