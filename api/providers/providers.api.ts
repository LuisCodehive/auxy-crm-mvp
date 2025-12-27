import { http } from "../https"
import type { Provider } from "@/types"

export function createProvider(provider: Provider) {
  return http<void>("/providers", {
    method: "POST",
    body: JSON.stringify(provider)
  })
}

export function getProviderById(id: string) {
  return http<Provider>(`/providers/${id}`)
}

export function updateProvider(
  id: string,
  data: Partial<Provider>
) {
  return http<void>(`/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function getAllProviders() {
  return http<Provider[]>("/providers")
}

export function deleteProvider(id: string) {
  return http<void>(`/providers/${id}`, {
    method: "DELETE"
  })
}
