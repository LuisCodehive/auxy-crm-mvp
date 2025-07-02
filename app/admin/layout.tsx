"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
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

  if (!user || user.role !== "admin") {
    return null
  }

  const getActiveTab = () => {
    if (pathname === "/admin") return "dashboard"
    return pathname.split("/admin/")[1] || "dashboard"
  }

  const getTabTitle = () => {
    const activeTab = getActiveTab()
    switch (activeTab) {
      case "dashboard":
        return { title: "Dashboard", subtitle: "Resumen general de la plataforma" }
      case "requests":
        return { title: "Solicitudes", subtitle: "Gestión de solicitudes de auxilio" }
      case "users":
        return { title: "Usuarios", subtitle: "Administración de usuarios" }
      case "providers":
        return { title: "Proveedores", subtitle: "Gestión de empresas prestadoras" }
      case "vehicles":
        return { title: "Vehículos", subtitle: "Monitoreo de flota" }
      case "analytics":
        return { title: "Analíticas", subtitle: "Métricas y estadísticas" }
      case "reports":
        return { title: "Reportes", subtitle: "Informes del sistema" }
      case "locations":
        return { title: "Ubicaciones", subtitle: "Gestión de zonas de servicio" }
      case "notifications":
        return { title: "Notificaciones", subtitle: "Centro de notificaciones" }
      case "settings":
        return { title: "Configuración", subtitle: "Ajustes del sistema" }
      default:
        return { title: "Dashboard", subtitle: "Resumen general de la plataforma" }
    }
  }

  const { title, subtitle } = getTabTitle()

  return (
    <div className="min-h-screen bg-auxy-gray">
      <AdminSidebar activeTab={getActiveTab()} />
      <div className="ml-16 min-h-screen">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
