import { http } from "../https"
import type { Vehicle } from "@/types"

export type CreateVehicleDTO = Omit<
  Vehicle,
  "id" | "location" | "driverId"
>

export function createVehicle(data: CreateVehicleDTO) {
  return http<{ id: string }>("/vehicles", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function getVehicleById(id: string) {
  return http<Vehicle>(`/vehicles/${id}`)
}

export function getVehiclesByProvider(providerId: string) {
  return http<Vehicle[]>(`/vehicles?providerId=${providerId}`)
}

export type UpdateVehicleDTO = Partial<
  Pick<Vehicle, "status" | "location" | "driverId">
>

export function updateVehicle(
  id: string,
  data: UpdateVehicleDTO
) {
  return http<void>(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}