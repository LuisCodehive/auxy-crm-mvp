"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, ServiceRequest } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Users,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Activity,
  DollarSign,
} from "lucide-react"

export default function SuperAdminClients() {
  const [clients, setClients] = useState<User[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clientsUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]

      const clientUsers = allUsers.filter((user) => user.role === "client")
      setClients(clientUsers)
      setLoading(false)
    })

    const requestsUnsubscribe = onSnapshot(collection(db, "serviceRequests"), (snapshot) => {
      const allRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setRequests(allRequests)
    })

    return () => {
      clientsUnsubscribe()
      requestsUnsubscribe()
    }
  }, [])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getClientStats = (clientId: string) => {
    const clientRequests = requests.filter((r) => r.clientId === clientId)
    const completedRequests = clientRequests.filter((r) => r.status === "completed")
    const totalSpent = completedRequests.reduce((sum, r) => sum + (r.finalPrice || 0), 0)

    return {
      totalRequests: clientRequests.length,
      completedRequests: completedRequests.length,
      totalSpent,
      lastRequest: clientRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0],
    }
  }

  const handleVerifyClient = async (clientId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, "users", clientId), {
        isVerified: !isVerified,
      })
      toast.success(`Cliente ${!isVerified ? "verificado" : "desverificado"} exitosamente`)
    } catch (error) {
      toast.error("Error al actualizar el estado del cliente")
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteDoc(doc(db, "users", clientId))
      toast.success("Cliente eliminado exitosamente")
    } catch (error) {
      toast.error("Error al eliminar el cliente")
    }
  }

  const ClientDetailModal = ({ client }: { client: User }) => {
    const stats = getClientStats(client.id)
    const clientRequests = requests.filter((r) => r.clientId === client.id)

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-blue-500 text-white">{client.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{client.name}</h3>
              <p className="text-sm text-gray-500">Cliente ID: {client.id}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Registrado: {client.createdAt?.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {client.isVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{client.isVerified ? "Verificado" : "No verificado"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
                  <p className="text-xs text-gray-600">Total Solicitudes</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.completedRequests}</p>
                  <p className="text-xs text-gray-600">Completadas</p>
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">${stats.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Total Gastado</p>
              </div>
              {stats.lastRequest && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-600">Última Solicitud</p>
                  <p className="text-xs text-gray-500">{stats.lastRequest.createdAt.toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {clientRequests.length > 0 ? (
                clientRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">#{request.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">
                        {request.type} - {request.createdAt.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{request.location.address}</p>
                    </div>
                    <div className="text-right">
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
                      {request.finalPrice && (
                        <p className="text-xs text-gray-500 mt-1">${request.finalPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No hay solicitudes registradas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-gray-600">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.filter((c) => c.isVerified).length}</p>
                <p className="text-sm text-gray-600">Verificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status !== "cancelled").length}</p>
                <p className="text-sm text-gray-600">Solicitudes Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  $
                  {requests
                    .filter((r) => r.status === "completed")
                    .reduce((sum, r) => sum + (r.finalPrice || 0), 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
          <CardDescription>Administra todos los clientes registrados en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de clientes */}
          <div className="space-y-4">
            {filteredClients.map((client) => {
              const stats = getClientStats(client.id)
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {client.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                      {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{stats.totalRequests} solicitudes</p>
                      <p className="text-sm text-gray-500">${stats.totalSpent.toLocaleString()} gastado</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={client.isVerified ? "default" : "secondary"}>
                        {client.isVerified ? "Verificado" : "No verificado"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedClient && <ClientDetailModal client={selectedClient} />}
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyClient(client.id, client.isVerified)}
                      >
                        {client.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente {client.name} y
                              todos sus datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteClient(client.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron clientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
