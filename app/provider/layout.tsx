"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { ProviderSidebar } from "@/components/provider/provider-sidebar"
import { ProviderHeader } from "@/components/provider/provider-header"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "provider")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "provider") {
    return null
  }

  const getActiveTab = () => {
    if (pathname === "/provider") return "dashboard"
    return pathname.split("/provider/")[1] || "dashboard"
  }

  const getTabTitle = () => {
    const activeTab = getActiveTab()
    switch (activeTab) {
      case "dashboard":
        return { title: "Dashboard", subtitle: "Panel de control del proveedor" }
      case "requests":
        return { title: "Solicitudes", subtitle: "Gestión de solicitudes de auxilio" }
      case "fleet":
        return { title: "Flota", subtitle: "Gestión de vehículos y conductores" }
      case "services":
        return { title: "Servicios", subtitle: "Historial de servicios prestados" }
      case "drivers":
        return { title: "Conductores", subtitle: "Gestión del equipo de trabajo" }
      case "analytics":
        return { title: "Analíticas", subtitle: "Métricas y estadísticas" }
      case "earnings":
        return { title: "Ganancias", subtitle: "Reportes financieros" }
      case "zones":
        return { title: "Zonas", subtitle: "Áreas de servicio" }
      case "notifications":
        return { title: "Notificaciones", subtitle: "Centro de notificaciones" }
      case "settings":
        return { title: "Configuración", subtitle: "Ajustes de la cuenta" }
      default:
        return { title: "Dashboard", subtitle: "Panel de control del proveedor" }
    }
  }

  const { title, subtitle } = getTabTitle()

  return (
    <div className="min-h-screen bg-auxy-gray">
      <ProviderSidebar activeTab={getActiveTab()} />
      <div className="ml-16 min-h-screen">
        <ProviderHeader title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
