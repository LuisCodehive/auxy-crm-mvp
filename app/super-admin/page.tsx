"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceRequest, User, Vehicle, Driver } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/admin/stats-card"
import {
  BarChart3,
  Users,
  Truck,
  Clock,
  Activity,
  Shield,
  CheckCircle,
  Crown,
  UserCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react"

export default function SuperAdminDashboard() {
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [allDrivers, setAllDrivers] = useState<Driver[]>([])

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
    })

    // Listen to all vehicles
    const vehiclesUnsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const vehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setAllVehicles(vehicles)
    })

    // Listen to all drivers
    const driversUnsubscribe = onSnapshot(collection(db, "drivers"), (snapshot) => {
      const drivers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[]
      setAllDrivers(drivers)
    })

    return () => {
      requestsUnsubscribe()
      usersUnsubscribe()
      vehiclesUnsubscribe()
      driversUnsubscribe()
    }
  }, [])

  const getStats = () => {
    const totalRequests = allRequests.length
    const completedRequests = allRequests.filter((r) => r.status === "completed").length
    const activeRequests = allRequests.filter((r) => r.status === "assigned" || r.status === "in_progress").length
    const pendingRequests = allRequests.filter((r) => r.status === "pending").length
    const totalClients = allUsers.filter((u) => u.role === "client").length
    const totalProviders = allUsers.filter((u) => u.role === "provider").length
    const totalAdmins = allUsers.filter((u) => u.role === "admin").length
    const availableVehicles = allVehicles.filter((v) => v.status === "available").length
    const availableDrivers = allDrivers.filter((d) => d.status === "available").length
    const totalRevenue = completedRequests * 800 // Estimación promedio

    return {
      totalRequests,
      completedRequests,
      activeRequests,
      pendingRequests,
      totalClients,
      totalProviders,
      totalAdmins,
      availableVehicles,
      availableDrivers,
      totalRevenue,
      totalUsers: allUsers.length,
      totalVehicles: allVehicles.length,
      totalDrivers: allDrivers.length,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={Crown}
          color="purple"
          trend={{ value: 25, isPositive: true }}
        />
        <StatsCard
          title="Ingresos Totales"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="Solicitudes Totales"
          value={stats.totalRequests}
          icon={BarChart3}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Tasa de Completado"
          value={`${Math.round((stats.completedRequests / stats.totalRequests) * 100) || 0}%`}
          icon={TrendingUp}
          color="orange"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Clientes"
          value={stats.totalClients}
          icon={Users}
          color="blue"
          trend={{ value: 20, isPositive: true }}
        />
        <StatsCard
          title="Proveedores"
          value={stats.totalProviders}
          icon={Shield}
          color="indigo"
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard title="Administradores" value={stats.totalAdmins} icon={Crown} color="purple" />
        <StatsCard title="Vehículos" value={stats.totalVehicles} icon={Truck} color="green" />
        <StatsCard title="Conductores" value={stats.totalDrivers} icon={UserCheck} color="orange" />
      </div>

      {/* Request Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <StatsCard title="Disponibles" value={stats.availableVehicles} icon={Truck} color="green" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas solicitudes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">#{request.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">
                        {request.type} - {request.location.address}
                      </p>
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
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nuevos Usuarios
            </CardTitle>
            <CardDescription>Registros recientes en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allUsers.slice(-5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        user.role === "client"
                          ? "bg-blue-500"
                          : user.role === "provider"
                            ? "bg-green-500"
                            : user.role === "admin"
                              ? "bg-purple-500"
                              : "bg-yellow-500"
                      }`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      user.role === "client"
                        ? "border-blue-200 text-blue-700"
                        : user.role === "provider"
                          ? "border-green-200 text-green-700"
                          : user.role === "admin"
                            ? "border-purple-200 text-purple-700"
                            : "border-yellow-200 text-yellow-700"
                    }`}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
