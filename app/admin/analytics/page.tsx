"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ServiceRequest, User, Vehicle } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, TrendingUp, Clock } from "lucide-react"

export default function AnalyticsPage() {
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])

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
    })

    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]
      setAllUsers(users)
    })

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

  const getAnalytics = () => {
    const completedRequests = allRequests.filter((r) => r.status === "completed")
    const totalRequests = allRequests.length
    const completionRate = totalRequests > 0 ? ((completedRequests.length / totalRequests) * 100).toFixed(1) : "0"

    // Calcular tiempo promedio de respuesta (simulado)
    const avgResponseTime = "12"

    // Rating promedio (simulado)
    const avgRating = "4.7"

    // Crecimiento mensual (simulado)
    const monthlyGrowth = "15"

    return {
      completionRate,
      avgResponseTime,
      avgRating,
      monthlyGrowth,
      totalRequests,
      completedRequests: completedRequests.length,
    }
  }

  const analytics = getAnalytics()

  const zoneData = [
    { name: "Centro", percentage: 35, requests: Math.floor(allRequests.length * 0.35) },
    { name: "Norte", percentage: 28, requests: Math.floor(allRequests.length * 0.28) },
    { name: "Sur", percentage: 22, requests: Math.floor(allRequests.length * 0.22) },
    { name: "Oeste", percentage: 15, requests: Math.floor(allRequests.length * 0.15) },
  ]

  const serviceTypes = [
    { type: "Remolque", count: allRequests.filter((r) => r.type === "towing").length },
    { type: "Batería", count: allRequests.filter((r) => r.type === "battery").length },
    { type: "Rueda", count: allRequests.filter((r) => r.type === "tire").length },
    { type: "Combustible", count: allRequests.filter((r) => r.type === "fuel").length },
    { type: "Cerrajería", count: allRequests.filter((r) => r.type === "lockout").length },
    { type: "Otros", count: allRequests.filter((r) => r.type === "other").length },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Completación</p>
                <p className="text-2xl font-bold text-auxy-navy">{analytics.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-auxy-navy">{analytics.avgResponseTime} min</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-auxy-navy">{analytics.avgRating}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
                <p className="text-2xl font-bold text-auxy-navy">+{analytics.monthlyGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-auxy-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Métricas de Servicio</CardTitle>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiempo promedio de respuesta:</span>
                <span className="font-medium text-auxy-navy">{analytics.avgResponseTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de completación:</span>
                <span className="font-medium text-auxy-navy">{analytics.completionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rating promedio:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-auxy-navy">{analytics.avgRating}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Servicios completados:</span>
                <span className="font-medium text-auxy-navy">
                  {analytics.completedRequests} de {analytics.totalRequests}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Distribución por Zonas</CardTitle>
            <CardDescription>Demanda de servicios por área geográfica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zoneData.map((zone) => (
                <div key={zone.name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{zone.name}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-auxy-red rounded-full" style={{ width: `${zone.percentage}%` }}></div>
                    </div>
                    <span className="font-medium text-auxy-navy w-12 text-right">{zone.percentage}%</span>
                    <span className="text-xs text-gray-500 w-16 text-right">({zone.requests})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Tipos de Servicio</CardTitle>
            <CardDescription>Distribución de solicitudes por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceTypes.map((service) => (
                <div key={service.type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{service.type}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-auxy-navy">{service.count}</span>
                    <span className="text-xs text-gray-500">
                      ({analytics.totalRequests > 0 ? ((service.count / analytics.totalRequests) * 100).toFixed(1) : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Tendencias de Rendimiento</CardTitle>
            <CardDescription>Evolución de métricas clave</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuarios activos:</span>
                <span className="font-medium text-auxy-navy">{allUsers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vehículos en flota:</span>
                <span className="font-medium text-auxy-navy">{allVehicles.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proveedores activos:</span>
                <span className="font-medium text-auxy-navy">
                  {allUsers.filter((u) => u.role === "provider").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Crecimiento mensual:</span>
                <span className="font-medium text-green-600">+{analytics.monthlyGrowth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
