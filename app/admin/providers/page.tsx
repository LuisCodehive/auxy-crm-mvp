"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Eye } from "lucide-react"

export default function ProvidersPage() {
  const [allProviders, setAllProviders] = useState<User[]>([])
  const [pendingProviders, setPendingProviders] = useState<User[]>([])
  const [approvedProviders, setApprovedProviders] = useState<User[]>([])

  useEffect(() => {
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]

      const providers = users.filter((u) => u.role === "provider")
      setAllProviders(providers)

      const pending = providers.filter((p) => "isApproved" in p && !p.isApproved)
      setPendingProviders(pending)

      const approved = providers.filter((p) => "isApproved" in p && p.isApproved)
      setApprovedProviders(approved)
    })

    return usersUnsubscribe
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-auxy-navy">{allProviders.length}</p>
              <p className="text-sm text-gray-600">Total Proveedores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingProviders.length}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{approvedProviders.length}</p>
              <p className="text-sm text-gray-600">Aprobados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Proveedores Pendientes de Aprobación</CardTitle>
          <CardDescription>Requieren revisión y aprobación manual</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProviders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay proveedores pendientes de aprobación</p>
          ) : (
            <div className="space-y-4">
              {pendingProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-medium text-auxy-navy">{provider.name}</p>
                      <p className="text-sm text-gray-600">{provider.email}</p>
                      {"companyName" in provider && (
                        <p className="text-sm text-gray-500">Empresa: {provider.companyName}</p>
                      )}
                      {"businessLicense" in provider && (
                        <p className="text-xs text-gray-400">Licencia: {provider.businessLicense}</p>
                      )}
                      <p className="text-xs text-gray-400">Registrado: {provider.createdAt?.toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pendiente
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                    <Button size="sm" className="bg-auxy-red hover:bg-auxy-red-dark flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Proveedores Aprobados</CardTitle>
          <CardDescription>Empresas prestadoras activas en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {approvedProviders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay proveedores aprobados</p>
          ) : (
            <div className="space-y-4">
              {approvedProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-auxy-navy">{provider.name}</p>
                      <p className="text-sm text-gray-600">{provider.email}</p>
                      {"companyName" in provider && (
                        <p className="text-sm text-gray-500">Empresa: {provider.companyName}</p>
                      )}
                      {"rating" in provider && <p className="text-xs text-gray-400">Rating: {provider.rating}/5</p>}
                      {"totalServices" in provider && (
                        <p className="text-xs text-gray-400">Servicios: {provider.totalServices}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
                      <Button size="sm" variant="outline">
                        Ver Perfil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
