"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ClientDashboard } from "./client-dashboard"
import { ProviderDashboard } from "./provider-dashboard"
import { Card, CardContent } from "@/components/ui/card"

export function MainDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin")
        return
      }
      if (user.role === "provider") {
        router.push("/provider")
        return
      }
      if (user.role === "super_admin") {
        router.push("/super-admin")
        return
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Cargando...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Si es admin, provider o super_admin, no renderizar nada aquí ya que se redirige
  if (user.role === "admin" || user.role === "provider" || user.role === "super_admin") {
    return null
  }

  switch (user.role) {
    case "client":
      return <ClientDashboard />
    case "provider":
      return <ProviderDashboard />
    default:
      return <div>Rol no reconocido</div>
  }
}
