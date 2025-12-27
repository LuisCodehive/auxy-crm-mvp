import { http } from "../https"
import type { Vehicle } from "@/types"

export function createVehicle(Vehicle: Vehicle) {
  return http<void>("/vehicules", {
    method: "POST",
    body: JSON.stringify(Vehicle)
  })
}

export function getVehicleById(id: string) {
  return http<Vehicle>(`/vehicules/${id}`)
}

export function updateVehicle(id: string, data: Partial<Vehicle>) {
  return http<void>(`/vehicules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteVehicle(id: string) {
  return http<void>(`/vehicules/${id}`, {
    method: "DELETE"
  })
}

export function getAllVehicles() {
  return http<Vehicle[]>("/vehicules")
}
