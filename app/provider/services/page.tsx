"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { ServiceRequest } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin, Star } from "lucide-react"

export default function ProviderServicesPage() {
  const { user } = useAuth()
  const [allServices, setAllServices] = useState<ServiceRequest[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user) return

    const servicesQuery = query(
      collection(db, "serviceRequests"),
      where("providerId", "==", user.id),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
      const services = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setAllServices(services)
      setFilteredServices(services)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    let filtered = allServices

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((service) => service.status === statusFilter)
    }

    setFilteredServices(filtered)
  }, [allServices, searchTerm, statusFilter])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-auxy-navy">{allServices.length}</p>
              <p className="text-sm text-gray-600">Total Servicios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {allServices.filter((s) => s.status === "completed").length}
              </p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {allServices.filter((s) => s.status === "assigned" || s.status === "in_progress").length}
              </p>
              <p className="text-sm text-gray-600">En Progreso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-auxy-navy">
                {allServices.filter((s) => s.rating).length > 0
                  ? (
                      allServices.filter((s) => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) /
                      allServices.filter((s) => s.rating).length
                    ).toFixed(1)
                  : "0.0"}
                /5
              </p>
              <p className="text-sm text-gray-600">Rating Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Buscar por ID, tipo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Historial de Servicios</CardTitle>
          <CardDescription>
            Mostrando {filteredServices.length} de {allServices.length} servicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay servicios que coincidan con los filtros</p>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-auxy-navy">
                        #{service.id.slice(-6)} - {service.type}
                      </p>
                      <p className="text-sm text-gray-600">{service.createdAt?.toLocaleString()}</p>
                    </div>
                    <Badge
                      variant={
                        service.status === "completed"
                          ? "default"
                          : service.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        service.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : service.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : service.status === "assigned"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                      }
                    >
                      {service.status === "completed" && "Completado"}
                      {service.status === "cancelled" && "Cancelado"}
                      {service.status === "assigned" && "Asignado"}
                      {service.status === "in_progress" && "En Progreso"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    {service.location.address}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {service.finalPrice && (
                        <span className="text-sm font-medium text-green-600">
                          ${service.finalPrice.toLocaleString()}
                        </span>
                      )}
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{service.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
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
