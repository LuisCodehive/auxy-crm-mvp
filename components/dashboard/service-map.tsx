"use client"

import { useEffect, useRef } from "react"
import type { ServiceRequest } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ServiceMapProps {
  serviceRequest: ServiceRequest
}

export function ServiceMap({ serviceRequest }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize Google Maps
    if (mapRef.current && typeof window !== "undefined") {
      // This would integrate with Google Maps API
      // For now, we'll show a placeholder
      mapRef.current.innerHTML = `
        <div class="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <p class="text-gray-600">Mapa de Seguimiento</p>
            <p class="text-sm text-gray-500">Ubicación: ${serviceRequest.location.address}</p>
          </div>
        </div>
      `
    }
  }, [serviceRequest])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguimiento en Tiempo Real</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} />
      </CardContent>
    </Card>
  )
}
