"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { ServiceRequest } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Search, Filter, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notifyServiceAssigned, notifyServiceCompleted, notifyServiceInProgress } from "@/lib/notification-service"

export default function ProviderRequestsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [assignedRequests, setAssignedRequests] = useState<ServiceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    if (!user) return

    // Listen to pending requests
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
    const assignedQuery = query(
      collection(db, "serviceRequests"),
      where("providerId", "==", user.id),
      where("status", "in", ["assigned", "in_progress"]),
    )
    const unsubscribeAssigned = onSnapshot(assignedQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
      })) as ServiceRequest[]
      setAssignedRequests(requests)
    })

    return () => {
      unsubscribePending()
      unsubscribeAssigned()
    }
  }, [user])

  const acceptRequest = async (requestId: string) => {
    if (!user) return

    try {
      // Primero obtenemos la solicitud para tener el ID del cliente
      const requestRef = doc(db, "serviceRequests", requestId)
      const requestSnapshot = await requestRef.get()
      const requestData = requestSnapshot.data()

      if (!requestData) {
        throw new Error("No se encontró la solicitud")
      }

      const clientId = requestData.clientId

      // Actualizamos el estado de la solicitud
      await updateDoc(requestRef, {
        providerId: user.id,
        status: "assigned",
        assignedAt: new Date(),
      })

      // Enviamos notificaciones
      await notifyServiceAssigned(clientId, user.id, requestId)

      toast({
        title: "Solicitud aceptada",
        description: "La solicitud ha sido asignada a tu empresa",
      })
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Error",
        description: "No se pudo aceptar la solicitud",
        variant: "destructive",
      })
    }
  }

  const startService = async (requestId: string) => {
    try {
      // Primero obtenemos la solicitud para tener el ID del cliente
      const requestRef = doc(db, "serviceRequests", requestId)
      const requestSnapshot = await requestRef.get()
      const requestData = requestSnapshot.data()

      if (!requestData || !user) {
        throw new Error("No se encontró la solicitud o el usuario")
      }

      const clientId = requestData.clientId

      // Actualizamos el estado de la solicitud
      await updateDoc(requestRef, {
        status: "in_progress",
      })

      // Enviamos notificaciones
      await notifyServiceInProgress(clientId, user.id, requestId)

      toast({
        title: "Servicio iniciado",
        description: "El servicio ha sido marcado como en progreso",
      })
    } catch (error) {
      console.error("Error starting service:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el servicio",
        variant: "destructive",
      })
    }
  }

  const completeRequest = async (requestId: string) => {
    try {
      // Primero obtenemos la solicitud para tener el ID del cliente
      const requestRef = doc(db, "serviceRequests", requestId)
      const requestSnapshot = await requestRef.get()
      const requestData = requestSnapshot.data()

      if (!requestData || !user) {
        throw new Error("No se encontró la solicitud o el usuario")
      }

      const clientId = requestData.clientId

      // Actualizamos el estado de la solicitud
      await updateDoc(requestRef, {
        status: "completed",
        completedAt: new Date(),
      })

      // Enviamos notificaciones
      await notifyServiceCompleted(clientId, user.id, requestId)

      toast({
        title: "Servicio completado",
        description: "El servicio ha sido marcado como completado",
      })
    } catch (error) {
      console.error("Error completing service:", error)
      toast({
        title: "Error",
        description: "No se pudo completar el servicio",
        variant: "destructive",
      })
    }
  }

  const filteredPendingRequests = pendingRequests.filter((request) => {
    const matchesSearch =
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || request.type === typeFilter
    return matchesSearch && matchesType
  })

  const filteredAssignedRequests = assignedRequests.filter((request) => {
    const matchesSearch =
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || request.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por tipo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="towing">Remolque</SelectItem>
                <SelectItem value="battery">Batería</SelectItem>
                <SelectItem value="tire">Rueda</SelectItem>
                <SelectItem value="fuel">Combustible</SelectItem>
                <SelectItem value="lockout">Cerrajería</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendientes ({filteredPendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Asignadas ({filteredAssignedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Solicitudes Pendientes</CardTitle>
              <CardDescription>Nuevas oportunidades de servicio en tu área</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPendingRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes</p>
              ) : (
                <div className="space-y-4">
                  {filteredPendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-auxy-navy">
                            #{request.id.slice(-6)} - {request.type}
                          </p>
                          <p className="text-sm text-gray-600">{request.createdAt?.toLocaleString()}</p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pendiente
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {request.location.address}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                        <Button
                          size="sm"
                          className="bg-auxy-red hover:bg-auxy-red-dark"
                          onClick={() => acceptRequest(request.id)}
                        >
                          Aceptar Solicitud
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Servicios Asignados</CardTitle>
              <CardDescription>Servicios que tienes en progreso</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAssignedRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tienes servicios asignados</p>
              ) : (
                <div className="space-y-4">
                  {filteredAssignedRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-auxy-navy">
                            #{request.id.slice(-6)} - {request.type}
                          </p>
                          <p className="text-sm text-gray-600">Asignado: {request.assignedAt?.toLocaleString()}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            request.status === "assigned"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {request.status === "assigned" ? "Asignado" : "En Progreso"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {request.location.address}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          Contactar Cliente
                        </Button>
                        {request.status === "assigned" && (
                          <Button
                            size="sm"
                            className="bg-auxy-red hover:bg-auxy-red-dark"
                            onClick={() => startService(request.id)}
                          >
                            Iniciar Servicio
                          </Button>
                        )}
                        {request.status === "in_progress" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => completeRequest(request.id)}
                          >
                            Completar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
