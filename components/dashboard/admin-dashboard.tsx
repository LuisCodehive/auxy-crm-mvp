"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceRequest, User, Vehicle } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCard } from "@/components/admin/stats-card"
import { BarChart3, Users, Truck, MapPin, Clock, Star, Activity, Shield, CheckCircle, XCircle } from "lucide-react"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [pendingProviders, setPendingProviders] = useState<User[]>([])

  useEffect(() => {
    // Listen to all service requests
    const requestsUnsubscribe = onSnapshot(collection(db, "serviceRequests"), (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        assignedAt: doc.data().assignedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setAllRequests(requests)
    })

    // Listen to all users
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]
      setAllUsers(users)

      // Filter pending providers
      const pending = users.filter((u) => u.role === "provider" && "isApproved" in u && !u.isApproved)
      setPendingProviders(pending)
    })

    // Listen to all vehicles
    const vehiclesUnsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const vehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setAllVehicles(vehicles)
    })

    return () => {
      requestsUnsubscribe()
      usersUnsubscribe()
      vehiclesUnsubscribe()
    }
  }, [])

  const getStats = () => {
    const totalRequests = allRequests.length
    const completedRequests = allRequests.filter((r) => r.status === "completed").length
    const activeRequests = allRequests.filter((r) => r.status === "assigned" || r.status === "in_progress").length
    const pendingRequests = allRequests.filter((r) => r.status === "pending").length
    const totalClients = allUsers.filter((u) => u.role === "client").length
    const totalProviders = allUsers.filter((u) => u.role === "provider").length
    const availableVehicles = allVehicles.filter((v) => v.status === "available").length

    return {
      totalRequests,
      completedRequests,
      activeRequests,
      pendingRequests,
      totalClients,
      totalProviders,
      availableVehicles,
    }
  }

  const stats = getStats()

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return { title: "Dashboard", subtitle: "Resumen general de la plataforma" }
      case "requests":
        return { title: "Solicitudes", subtitle: "Gestión de solicitudes de auxilio" }
      case "users":
        return { title: "Usuarios", subtitle: "Administración de usuarios" }
      case "providers":
        return { title: "Proveedores", subtitle: "Gestión de empresas prestadoras" }
      case "vehicles":
        return { title: "Vehículos", subtitle: "Monitoreo de flota" }
      case "analytics":
        return { title: "Analíticas", subtitle: "Métricas y estadísticas" }
      default:
        return { title: "Dashboard", subtitle: "Resumen general de la plataforma" }
    }
  }

  const { title, subtitle } = getTabTitle()

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Solicitudes"
                value={stats.totalRequests}
                icon={BarChart3}
                color="blue"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Solicitudes Activas"
                value={stats.activeRequests}
                icon={Activity}
                color="orange"
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Completadas"
                value={stats.completedRequests}
                icon={CheckCircle}
                color="green"
                trend={{ value: 15, isPositive: true }}
              />
              <StatsCard
                title="Pendientes"
                value={stats.pendingRequests}
                icon={Clock}
                color="red"
                trend={{ value: 5, isPositive: false }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title="Clientes"
                value={stats.totalClients}
                icon={Users}
                color="purple"
                trend={{ value: 20, isPositive: true }}
              />
              <StatsCard
                title="Proveedores"
                value={stats.totalProviders}
                icon={Shield}
                color="indigo"
                trend={{ value: 3, isPositive: true }}
              />
              <StatsCard title="Vehículos Disponibles" value={stats.availableVehicles} icon={Truck} color="green" />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-auxy-navy">Solicitudes Recientes</CardTitle>
                  <CardDescription>Últimas solicitudes de auxilio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-auxy-red rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">#{request.id.slice(-6)}</p>
                            <p className="text-xs text-gray-500">{request.type}</p>
                          </div>
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
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-auxy-navy">Proveedores Pendientes</CardTitle>
                  <CardDescription>Requieren aprobación manual</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingProviders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay proveedores pendientes</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingProviders.slice(0, 3).map((provider) => (
                        <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{provider.name}</p>
                            <p className="text-xs text-gray-500">{provider.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              Rechazar
                            </Button>
                            <Button size="sm" className="text-xs bg-auxy-red hover:bg-auxy-red-dark">
                              Aprobar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "requests":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Todas las Solicitudes</CardTitle>
              <CardDescription>Monitoreo en tiempo real de solicitudes de auxilio</CardDescription>
            </CardHeader>
            <CardContent>
              {allRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay solicitudes registradas</p>
              ) : (
                <div className="space-y-4">
                  {allRequests.map((request) => (
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
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.location.address}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "users":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Gestión de Usuarios</CardTitle>
              <CardDescription>Administra todos los usuarios de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-auxy-navy">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Registrado: {user.createdAt?.toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                      {user.isVerified && <Badge className="bg-green-100 text-green-800">Verificado</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "providers":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Gestión de Proveedores</CardTitle>
              <CardDescription>Administra empresas prestadoras de servicio</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProviders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay proveedores pendientes de aprobación</p>
              ) : (
                <div className="space-y-4">
                  {pendingProviders.map((provider) => (
                    <div key={provider.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-medium text-auxy-navy">{provider.name}</p>
                          <p className="text-sm text-gray-600">{provider.email}</p>
                          {"companyName" in provider && (
                            <p className="text-sm text-gray-500">Empresa: {provider.companyName}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pendiente
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
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
        )

      case "vehicles":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Gestión de Vehículos</CardTitle>
              <CardDescription>Monitoreo de toda la flota de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-auxy-navy">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">Patente: {vehicle.licensePlate}</p>
                      <p className="text-xs text-gray-500 capitalize">Tipo: {vehicle.type.replace("_", " ")}</p>
                    </div>
                    <Badge
                      variant={
                        vehicle.status === "available"
                          ? "default"
                          : vehicle.status === "maintenance"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        vehicle.status === "available"
                          ? "bg-green-100 text-green-800"
                          : vehicle.status === "maintenance"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {vehicle.status === "available" && "Disponible"}
                      {vehicle.status === "busy" && "Ocupado"}
                      {vehicle.status === "maintenance" && "Mantenimiento"}
                      {vehicle.status === "offline" && "Desconectado"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-auxy-navy">Métricas de Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tiempo promedio de respuesta:</span>
                      <span className="font-medium text-auxy-navy">12 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tasa de completación:</span>
                      <span className="font-medium text-auxy-navy">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating promedio:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-auxy-navy">4.7/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-auxy-navy">Zonas de Mayor Demanda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Centro:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-3/5 h-2 bg-auxy-red rounded-full"></div>
                        </div>
                        <span className="font-medium text-auxy-navy">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Norte:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-1/2 h-2 bg-auxy-red rounded-full"></div>
                        </div>
                        <span className="font-medium text-auxy-navy">28%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sur:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-2/5 h-2 bg-auxy-red rounded-full"></div>
                        </div>
                        <span className="font-medium text-auxy-navy">22%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Oeste:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-1/4 h-2 bg-auxy-red rounded-full"></div>
                        </div>
                        <span className="font-medium text-auxy-navy">15%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return <div>Sección en desarrollo</div>
    }
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} title={title} subtitle={subtitle}>
      {renderContent()}
    </AdminLayout>
  )
}
