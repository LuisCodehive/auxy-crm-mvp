"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { ServiceRequest, Vehicle, Driver } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Users, MapPin, Clock } from "lucide-react"
import { FleetManagement } from "./fleet-management"

export function ProviderDashboard() {
  const { user, logout } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [assignedRequests, setAssignedRequests] = useState<ServiceRequest[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    if (!user) return

    // Listen to pending requests in the area
    const pendingQuery = query(collection(db, "serviceRequests"), where("status", "==", "pending"))

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as ServiceRequest[]
      setPendingRequests(requests)
    })

    // Listen to assigned requests
    const assignedQuery = query(collection(db, "serviceRequests"), where("providerId", "==", user.id))

    const unsubscribeAssigned = onSnapshot(assignedQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
      })) as ServiceRequest[]
      setAssignedRequests(requests)
    })

    // Listen to vehicles
    const vehiclesQuery = query(collection(db, "vehicles"), where("providerId", "==", user.id))

    const unsubscribeVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
      const vehicleData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setVehicles(vehicleData)
    })

    return () => {
      unsubscribePending()
      unsubscribeAssigned()
      unsubscribeVehicles()
    }
  }, [user])

  const acceptRequest = async (requestId: string) => {
    if (!user) return

    try {
      await updateDoc(doc(db, "serviceRequests", requestId), {
        providerId: user.id,
        status: "assigned",
        assignedAt: new Date(),
      })
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      assigned: "default",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auxy Proveedor</h1>
              <p className="text-gray-600">Panel de gestión - {user?.name}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Asignados</p>
                  <p className="text-2xl font-bold">{assignedRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vehículos</p>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conductores</p>
                  <p className="text-2xl font-bold">{drivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="fleet">Gestión de Flota</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes Pendientes</CardTitle>
                  <CardDescription>Nuevas solicitudes de auxilio en tu área</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{request.type}</p>
                              <p className="text-sm text-gray-600">{request.createdAt?.toLocaleTimeString()}</p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                          <p className="text-sm text-gray-500 mb-3">📍 {request.location.address}</p>
                          <Button size="sm" onClick={() => acceptRequest(request.id)} className="w-full">
                            Aceptar Solicitud
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Servicios Asignados</CardTitle>
                  <CardDescription>Servicios que tienes en progreso</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignedRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tienes servicios asignados</p>
                  ) : (
                    <div className="space-y-4">
                      {assignedRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{request.type}</p>
                              <p className="text-sm text-gray-600">
                                Asignado: {request.assignedAt?.toLocaleTimeString()}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Ver Detalles
                            </Button>
                            <Button size="sm">Completar</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fleet">
            <FleetManagement vehicles={vehicles} drivers={drivers} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">Historial de servicios completados</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
