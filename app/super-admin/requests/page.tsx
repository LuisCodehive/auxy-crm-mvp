"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceRequest, User as UserType } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Search, Eye, Clock, CheckCircle, XCircle, MapPin, Truck, Phone } from "lucide-react"

export default function SuperAdminRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const requestsUnsubscribe = onSnapshot(collection(db, "serviceRequests"), (snapshot) => {
      const allRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setRequests(allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setLoading(false)
    })

    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as UserType[]
      setUsers(allUsers)
    })

    return () => {
      requestsUnsubscribe()
      usersUnsubscribe()
    }
  }, [])

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusStats = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      assigned: requests.filter((r) => r.status === "assigned").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      completed: requests.filter((r) => r.status === "completed").length,
      cancelled: requests.filter((r) => r.status === "cancelled").length,
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || "Usuario no encontrado"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "assigned":
      case "in_progress":
        return <Activity className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const RequestDetailModal = ({ request }: { request: ServiceRequest }) => {
    const client = users.find((u) => u.id === request.clientId)
    const provider = users.find((u) => u.id === request.providerId)

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(request.status)}`}>{getStatusIcon(request.status)}</div>
            <div>
              <h3 className="text-xl font-bold">Solicitud #{request.id.slice(-8)}</h3>
              <p className="text-sm text-gray-500 capitalize">{request.type}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de la Solicitud */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles de la Solicitud</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Servicio</label>
                <p className="capitalize">{request.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p>{request.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ubicación</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <p>{request.location.address}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Precio Estimado</label>
                  <p>${request.estimatedPrice?.toLocaleString() || "No definido"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Precio Final</label>
                  <p>${request.finalPrice?.toLocaleString() || "Pendiente"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Participantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Participantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cliente */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-600">Cliente</span>
                </div>
                {client ? (
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Cliente no encontrado</p>
                )}
              </div>

              {/* Proveedor */}
              {request.providerId && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Proveedor</span>
                  </div>
                  {provider ? (
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-gray-600">{provider.email}</p>
                      <p className="text-sm text-gray-600">{(provider as any).companyName}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Proveedor no encontrado</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Solicitud creada</p>
                  <p className="text-xs text-gray-500">{request.createdAt.toLocaleString()}</p>
                </div>
              </div>

              {request.assignedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Asignada a proveedor</p>
                    <p className="text-xs text-gray-500">{request.assignedAt.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {request.completedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Completada</p>
                    <p className="text-xs text-gray-500">{request.completedAt.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        {request.rating && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Calificación:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < request.rating! ? "text-yellow-400" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {request.feedback && (
                  <div>
                    <span className="text-sm font-medium">Comentario:</span>
                    <p className="text-sm text-gray-600 mt-1">{request.feedback}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    )
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
              <p className="text-xs text-gray-600">Asignadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.in_progress}</p>
              <p className="text-xs text-gray-600">En Progreso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600">Completadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-xs text-gray-600">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Solicitudes</CardTitle>
          <CardDescription>Monitoreo global de todas las solicitudes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por ID, tipo, ubicación o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="assigned">Asignadas</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="towing">Grúa</SelectItem>
                <SelectItem value="battery">Batería</SelectItem>
                <SelectItem value="tire">Llanta</SelectItem>
                <SelectItem value="fuel">Combustible</SelectItem>
                <SelectItem value="lockout">Cerrajería</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de solicitudes */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <h3 className="font-medium">#{request.id.slice(-8)}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {request.type} - {request.location.address}
                    </p>
                    <p className="text-xs text-gray-400">
                      {request.createdAt.toLocaleDateString()} - Cliente: {getUserName(request.clientId)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {request.finalPrice
                        ? `$${request.finalPrice.toLocaleString()}`
                        : request.estimatedPrice
                          ? `~$${request.estimatedPrice.toLocaleString()}`
                          : "Sin precio"}
                    </p>
                    {request.providerId && (
                      <p className="text-xs text-gray-500">Proveedor: {getUserName(request.providerId)}</p>
                    )}
                  </div>

                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {selectedRequest && <RequestDetailModal request={selectedRequest} />}
                  </Dialog>
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron solicitudes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
