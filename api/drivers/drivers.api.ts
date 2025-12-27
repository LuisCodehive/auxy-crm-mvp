import { http } from "../https"
import type { Driver } from "@/types"

export function createDriver(driver: Driver) {
  return http<void>("/drivers", {
    method: "POST",
    body: JSON.stringify(driver)
  })
}

export function getdriverById(id: string) {
  return http<Driver>(`/drivers/${id}`)
}

export function updatedriver(
  id: string,
  data: Partial<Driver>
) {
  return http<void>(`/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function getAllDrivers() {
  return http<Driver[]>("/drivers")
}

export function deleteDriver(id: string) {
  return http<void>(`/drivers/${id}`, {
    method: "DELETE"
  })
}