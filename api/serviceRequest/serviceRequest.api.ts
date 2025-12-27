import { http } from "../https"
import type { ServiceRequest } from "@/types"

export function createServiceRequest(ServiceRequest: ServiceRequest) {
  return http<void>("/serviceRequest", {
    method: "POST",
    body: JSON.stringify(ServiceRequest)
  })
}

export function getServiceRequestById(id: string) {
  return http<ServiceRequest>(`/serviceRequest/${id}`)
}

/*export function updateServiceRequest(id: string, data: Partial<ServiceRequest>) {
  return http<void>(`/serviceRequest/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}*/

export function deleteServiceRequests(id: string) {
  return http<void>(`/serviceRequest/${id}`, {
    method: "DELETE"
  })
}

export function getAllServiceRequests() {
  return http<ServiceRequest[]>("/serviceRequest")
}

