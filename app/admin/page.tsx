"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceRequest, User, Vehicle } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/admin/stats-card"
import { BarChart3, Users, Truck, Clock, Activity, Shield, CheckCircle } from "lucide-react"

export default function AdminDashboard() {
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
}
