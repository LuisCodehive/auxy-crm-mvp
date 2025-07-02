"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, Vehicle, Driver, ServiceRequest } from "@/types"
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
  Shield,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  Star,
  Calendar,
  Phone,
  Mail,
  Building,
  FileText,
  UserCheck,
} from "lucide-react"

export default function SuperAdminProviders() {
  const [providers, setProviders] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const providersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]

      const providerUsers = allUsers.filter((user) => user.role === "provider")
      setProviders(providerUsers)
      setLoading(false)
    })

    const vehiclesUnsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const allVehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setVehicles(allVehicles)
    })

    const driversUnsubscribe = onSnapshot(collection(db, "drivers"), (snapshot) => {
      const allDrivers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[]
      setDrivers(allDrivers)
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
      providersUnsubscribe()
      vehiclesUnsubscribe()
      driversUnsubscribe()
      requestsUnsubscribe()
    }
  }, [])

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider as any).companyName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getProviderStats = (providerId: string) => {
    const providerVehicles = vehicles.filter((v) => v.providerId === providerId)
    const providerDrivers = drivers.filter((d) => d.providerId === providerId)
    const providerRequests = requests.filter((r) => r.providerId === providerId)
    const completedRequests = providerRequests.filter((r) => r.status === "completed")
    const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.finalPrice || 0), 0)

    return {
      totalVehicles: providerVehicles.length,
      availableVehicles: providerVehicles.filter((v) => v.status === "available").length,
      totalDrivers: providerDrivers.length,
      availableDrivers: providerDrivers.filter((d) => d.status === "available").length,
      totalRequests: providerRequests.length,
      completedRequests: completedRequests.length,
      totalEarnings,
      lastRequest: providerRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0],
    }
  }

  const handleApproveProvider = async (providerId: string, isApproved: boolean) => {
    try {
      await updateDoc(doc(db, "users", providerId), {
        isApproved: !isApproved,
      })
      toast.success(`Proveedor ${!isApproved ? "aprobado" : "desaprobado"} exitosamente`)
    } catch (error) {
      toast.error("Error al actualizar el estado del proveedor")
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    try {
      // Eliminar vehículos del proveedor
      const providerVehicles = vehicles.filter((v) => v.providerId === providerId)
      for (const vehicle of providerVehicles) {
        await deleteDoc(doc(db, "vehicles", vehicle.id))
      }

      // Eliminar conductores del proveedor
      const providerDrivers = drivers.filter((d) => d.providerId === providerId)
      for (const driver of providerDrivers) {
        await deleteDoc(doc(db, "drivers", driver.id))
      }

      // Eliminar proveedor
      await deleteDoc(doc(db, "users", providerId))

      toast.success("Proveedor y todos sus recursos eliminados exitosamente")
    } catch (error) {
      toast.error("Error al eliminar el proveedor")
    }
  }

  const ProviderDetailModal = ({ provider }: { provider: User }) => {
    const stats = getProviderStats(provider.id)
    const providerVehicles = vehicles.filter((v) => v.providerId === provider.id)
    const providerDrivers = drivers.filter((d) => d.providerId === provider.id)
    const providerRequests = requests.filter((r) => r.providerId === provider.id)

    return (
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-green-500 text-white">
                {provider.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{provider.name}</h3>
              <p className="text-sm text-gray-500">
                {(provider as any).companyName} - ID: {provider.id}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Proveedor */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{provider.email}</span>
                </div>
                {provider.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{provider.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{(provider as any).companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{(provider as any).businessLicense}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Registrado: {provider.createdAt?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {(provider as any).isApproved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {(provider as any).isApproved ? "Aprobado" : "Pendiente de aprobación"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Rating: {(provider as any).rating || 0}/5</span>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">{stats.totalRequests}</p>
                    <p className="text-xs text-gray-600">Solicitudes</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">{stats.completedRequests}</p>
                    <p className="text-xs text-gray-600">Completadas</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">{stats.totalVehicles}</p>
                    <p className="text-xs text-gray-600">Vehículos</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">{stats.totalDrivers}</p>
                    <p className="text-xs text-gray-600">Conductores</p>
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg mt-4">
                  <p className="text-xl font-bold text-yellow-600">${stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Ganancias Totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehículos y Conductores */}
          <div className="lg:col-span-2 space-y-4">
            {/* Vehículos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehículos ({providerVehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {providerVehicles.length > 0 ? (
                    providerVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-xs text-gray-500">
                            {vehicle.licensePlate} - {vehicle.type}
                          </p>
                        </div>
                        <Badge
                          variant={
                            vehicle.status === "available"
                              ? "default"
                              : vehicle.status === "busy"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No hay vehículos registrados</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conductores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Conductores ({providerDrivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {providerDrivers.length > 0 ? (
                    providerDrivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{driver.name}</p>
                          <p className="text-xs text-gray-500">
                            {driver.phone} - Licencia: {driver.licenseNumber}
                          </p>
                        </div>
                        <Badge
                          variant={
                            driver.status === "available"
                              ? "default"
                              : driver.status === "busy"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {driver.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No hay conductores registrados</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Historial de Solicitudes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de Solicitudes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {providerRequests.length > 0 ? (
                    providerRequests.slice(0, 10).map((request) => (
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
          </div>
        </div>
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{providers.length}</p>
                <p className="text-sm text-gray-600">Total Proveedores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{providers.filter((p) => (p as any).isApproved).length}</p>
                <p className="text-sm text-gray-600">Aprobados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-sm text-gray-600">Total Vehículos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drivers.length}</p>
                <p className="text-sm text-gray-600">Total Conductores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Proveedores</CardTitle>
          <CardDescription>Administra todos los proveedores registrados en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de proveedores */}
          <div className="space-y-4">
            {filteredProviders.map((provider) => {
              const stats = getProviderStats(provider.id)
              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback className="bg-green-500 text-white">
                        {provider.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{(provider as any).companyName}</p>
                      <p className="text-sm text-gray-500">{provider.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{stats.totalVehicles}</p>
                      <p className="text-xs text-gray-500">Vehículos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{stats.totalDrivers}</p>
                      <p className="text-xs text-gray-500">Conductores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{stats.completedRequests}</p>
                      <p className="text-xs text-gray-500">Servicios</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">${stats.totalEarnings.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Ganancias</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={(provider as any).isApproved ? "default" : "secondary"}>
                        {(provider as any).isApproved ? "Aprobado" : "Pendiente"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProvider(provider)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedProvider && <ProviderDetailModal provider={selectedProvider} />}
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveProvider(provider.id, (provider as any).isApproved)}
                      >
                        {(provider as any).isApproved ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor{" "}
                              {provider.name}, todos sus vehículos, conductores y datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProvider(provider.id)}
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

          {filteredProviders.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron proveedores</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
