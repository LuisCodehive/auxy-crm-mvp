"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { ServiceRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, MessageCircle, Star } from "lucide-react"
import { ServiceRequestForm } from "./service-request-form"
import { ServiceMap } from "./service-map"

export function ClientDashboard() {
  const { user, logout } = useAuth()
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [activeService, setActiveService] = useState<ServiceRequest | null>(null)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "serviceRequests"), where("clientId", "==", user.id), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serviceData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]

      setServices(serviceData)

      // Set active service if there's one in progress
      const inProgress = serviceData.find((s) => s.status === "assigned" || s.status === "in_progress")
      setActiveService(inProgress || null)
    })

    return unsubscribe
  }, [user])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      assigned: "default",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    } as const

    const labels = {
      pending: "Pendiente",
      assigned: "Asignado",
      in_progress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auxy Cliente</h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeService ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Servicio Activo
                </CardTitle>
                <CardDescription>Solicitud #{activeService.id.slice(-6)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Estado:</span>
                    {getStatusBadge(activeService.status)}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span> {activeService.type}
                  </div>
                  <div>
                    <span className="font-medium">Descripción:</span> {activeService.description}
                  </div>
                  {activeService.estimatedPrice && (
                    <div>
                      <span className="font-medium">Precio estimado:</span> ${activeService.estimatedPrice}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Llamar
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ServiceMap serviceRequest={activeService} />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Auxilio</CardTitle>
                <CardDescription>¿Necesitas asistencia vehicular? Solicita ayuda ahora.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowRequestForm(true)} className="w-full" size="lg">
                  Solicitar Auxilio
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tienes servicios registrados</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{service.type}</p>
                            <p className="text-sm text-gray-600">{service.createdAt?.toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(service.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        {service.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{service.rating}/5</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {showRequestForm && <ServiceRequestForm onClose={() => setShowRequestForm(false)} />}
    </div>
  )
}
