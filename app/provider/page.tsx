"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { ServiceRequest, Vehicle, Driver } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/admin/stats-card"
import { Truck, Users, Clock, DollarSign, Activity, CheckCircle, Star } from "lucide-react"

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([])
  const [assignedRequests, setAssignedRequests] = useState<ServiceRequest[]>([])
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([])
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

    // Listen to completed requests
    const completedQuery = query(
      collection(db, "serviceRequests"),
      where("providerId", "==", user.id),
      where("status", "==", "completed"),
    )
    const unsubscribeCompleted = onSnapshot(completedQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setCompletedRequests(requests)
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

    // Listen to drivers
    const driversQuery = query(collection(db, "drivers"), where("providerId", "==", user.id))
    const unsubscribeDrivers = onSnapshot(driversQuery, (snapshot) => {
      const driverData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[]
      setDrivers(driverData)
    })

    return () => {
      unsubscribePending()
      unsubscribeAssigned()
      unsubscribeCompleted()
      unsubscribeVehicles()
      unsubscribeDrivers()
    }
  }, [user])

  const getStats = () => {
    const totalEarnings = completedRequests.reduce((sum, req) => sum + (req.finalPrice || 0), 0)
    const availableVehicles = vehicles.filter((v) => v.status === "available").length
    const availableDrivers = drivers.filter((d) => d.status === "available").length
    const avgRating =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, req) => sum + (req.rating || 0), 0) / completedRequests.length
        : 0

    return {
      totalEarnings,
      availableVehicles,
      availableDrivers,
      avgRating: avgRating.toFixed(1),
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Solicitudes Pendientes"
          value={pendingRequests.length}
          icon={Clock}
          color="orange"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Servicios Activos"
          value={assignedRequests.length}
          icon={Activity}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Completados"
          value={completedRequests.length}
          icon={CheckCircle}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Ganancias del Mes"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          trend={{ value: 20, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Vehículos Disponibles" value={stats.availableVehicles} icon={Truck} color="indigo" />
        <StatsCard title="Conductores Disponibles" value={stats.availableDrivers} icon={Users} color="green" />
        <StatsCard title="Rating Promedio" value={`${stats.avgRating}/5`} icon={Star} color="red" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Solicitudes Pendientes</CardTitle>
            <CardDescription>Nuevas oportunidades de servicio</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-auxy-red rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">#{request.id.slice(-6)}</p>
                        <p className="text-xs text-gray-500">{request.type}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-auxy-red hover:bg-auxy-red-dark">
                      Aceptar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Servicios en Progreso</CardTitle>
            <CardDescription>Servicios asignados a tu empresa</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay servicios en progreso</p>
            ) : (
              <div className="space-y-4">
                {assignedRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">#{request.id.slice(-6)}</p>
                        <p className="text-xs text-gray-500">{request.type}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Estado de la Flota</CardTitle>
            <CardDescription>Resumen de vehículos y conductores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vehículos totales:</span>
                <span className="font-medium text-auxy-navy">{vehicles.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Disponibles:</span>
                <span className="font-medium text-green-600">{stats.availableVehicles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En servicio:</span>
                <span className="font-medium text-blue-600">{vehicles.filter((v) => v.status === "busy").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mantenimiento:</span>
                <span className="font-medium text-red-600">
                  {vehicles.filter((v) => v.status === "maintenance").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Rendimiento del Mes</CardTitle>
            <CardDescription>Métricas de desempeño</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Servicios completados:</span>
                <span className="font-medium text-auxy-navy">{completedRequests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rating promedio:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-auxy-navy">{stats.avgRating}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ganancias totales:</span>
                <span className="font-medium text-green-600">${stats.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiempo promedio:</span>
                <span className="font-medium text-auxy-navy">18 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
