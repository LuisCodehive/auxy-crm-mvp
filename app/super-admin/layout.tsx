"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"
import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
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

  if (!user || user.role !== "super_admin") {
    return null
  }

  const getActiveTab = () => {
    if (pathname === "/super-admin") return "dashboard"
    return pathname.split("/super-admin/")[1] || "dashboard"
  }

  const getTabTitle = () => {
    const activeTab = getActiveTab()
    switch (activeTab) {
      case "dashboard":
        return { title: "Super Dashboard", subtitle: "Control total de la plataforma" }
      case "clients":
        return { title: "Clientes", subtitle: "Gestión completa de clientes" }
      case "providers":
        return { title: "Proveedores", subtitle: "Gestión completa de proveedores" }
      case "requests":
        return { title: "Todas las Solicitudes", subtitle: "Monitoreo global de solicitudes" }
      case "vehicles":
        return { title: "Todos los Vehículos", subtitle: "Flota completa del sistema" }
      case "drivers":
        return { title: "Todos los Conductores", subtitle: "Personal de todos los proveedores" }
      case "analytics":
        return { title: "Analíticas Avanzadas", subtitle: "Métricas y estadísticas globales" }
      case "reports":
        return { title: "Reportes Ejecutivos", subtitle: "Informes detallados del sistema" }
      case "api-keys":
        return { title: "API Keys", subtitle: "Gestión de accesos externos" }
      case "system":
        return { title: "Sistema", subtitle: "Configuración y mantenimiento" }
      case "notifications":
        return { title: "Centro de Notificaciones", subtitle: "Comunicaciones del sistema" }
      default:
        return { title: "Super Dashboard", subtitle: "Control total de la plataforma" }
    }
  }

  const { title, subtitle } = getTabTitle()

  return (
    <div className="min-h-screen bg-auxy-gray">
      <SuperAdminSidebar activeTab={getActiveTab()} />
      <div className="ml-16 min-h-screen">
        <SuperAdminHeader title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
