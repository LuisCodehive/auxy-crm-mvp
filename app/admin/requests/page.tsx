"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceRequest } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Filter } from "lucide-react"

export default function RequestsPage() {
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const requestsUnsubscribe = onSnapshot(collection(db, "serviceRequests"), (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setAllRequests(requests)
      setFilteredRequests(requests)
    })

    return requestsUnsubscribe
  }, [])

  useEffect(() => {
    let filtered = allRequests

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }, [allRequests, searchTerm, statusFilter])

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
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Todas las Solicitudes</CardTitle>
          <CardDescription>
            Mostrando {filteredRequests.length} de {allRequests.length} solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay solicitudes que coincidan con los filtros</p>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-auxy-navy">
                        #{request.id.slice(-6)} - {request.type}
                      </p>
                      <p className="text-sm text-gray-600">{request.createdAt?.toLocaleString()}</p>
                    </div>
                    <Badge
                      variant={
                        request.status === "completed"
                          ? "default"
                          : request.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {request.status}
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
                    {request.status === "pending" && (
                      <Button size="sm" className="bg-auxy-red hover:bg-auxy-red-dark">
                        Asignar
                      </Button>
                    )}
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
