"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthForm } from "@/components/auth/auth-form"
import { MainDashboard } from "@/components/dashboard/main-dashboard"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Auxy CRM...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <MainDashboard />
}
