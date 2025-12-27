import { http } from "../https"
import type { ServiceRequest } from "@/types"

export type CreateServiceRequestDTO = Omit<
  ServiceRequest,
  | "id"
  | "status"
  | "createdAt"
  | "assignedAt"
  | "completedAt"
  | "providerId"
  | "driverId"
  | "vehicleId"
  | "estimatedPrice"
  | "finalPrice"
  | "rating"
  | "feedback"
>

export function createServiceRequest(
  data: CreateServiceRequestDTO
) {
  return http<{ id: string }>("/service-requests", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function getServiceRequestById(id: string) {
  return http<ServiceRequest>(`/service-requests/${id}`)
}

export function getServiceRequestsByClient(clientId: string) {
  return http<ServiceRequest[]>(
    `/service-requests?clientId=${clientId}`
  )
}

export type AssignServiceRequestDTO = {
  providerId: string
  driverId: string
  vehicleId: string
}

export function assignServiceRequest(
  requestId: string,
  data: AssignServiceRequestDTO
) {
  return http<void>(
    `/service-requests/${requestId}/assign`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  )
}

export type UpdateServiceStatusDTO = {
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
}

export function updateServiceRequestStatus(
  requestId: string,
  data: UpdateServiceStatusDTO
) {
  return http<void>(
    `/service-requests/${requestId}/status`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  )
}

export type CloseServiceRequestDTO = {
  rating: number
  feedback?: string
}

export function closeServiceRequest(
  requestId: string,
  data: CloseServiceRequestDTO
) {
  return http<void>(
    `/service-requests/${requestId}/close`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  )
}

