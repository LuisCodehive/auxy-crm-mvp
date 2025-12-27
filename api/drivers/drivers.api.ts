import { http } from "../https"
import type { Driver } from "@/types"

export type CreateDriverDTO = Omit<
  Driver,
  "id" | "vehicleId" | "location"
>

export function createDriver(data: CreateDriverDTO) {
  return http<{ id: string }>("/drivers", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function getDriverById(id: string) {
  return http<Driver>(`/drivers/${id}`)
}

export function getDriversByProvider(providerId: string) {
  return http<Driver[]>(`/drivers?providerId=${providerId}`)
}

export type UpdateDriverDTO = Partial<
  Pick<Driver, "status" | "location" | "vehicleId">
>

export function updateDriver(
  id: string,
  data: UpdateDriverDTO
) {
  return http<void>(`/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export type AssignVehicleDTO = {
  vehicleId: string
}

export function assignVehicleToDriver(
  driverId: string,
  data: AssignVehicleDTO
) {
  return http<void>(
    `/drivers/${driverId}/assign-vehicle`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  )
}