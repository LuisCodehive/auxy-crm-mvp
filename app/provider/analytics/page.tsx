"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { ServiceRequest, Vehicle, Driver } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, TrendingUp, Clock, DollarSign } from "lucide-react"

export default function ProviderAnalyticsPage() {
  const { user } = useAuth()
  const [allServices, setAllServices] = useState<ServiceRequest[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    if (!user) return

    const servicesQuery = query(collection(db, "serviceRequests"), where("providerId", "==", user.id))
    const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
      const services = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as ServiceRequest[]
      setAllServices(services)
    })

    const vehiclesQuery = query(collection(db, "vehicles"), where("providerId", "==", user.id))
    const unsubscribeVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
      const vehicleData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setVehicles(vehicleData)
    })

    const driversQuery = query(collection(db, "drivers"), where("providerId", "==", user.id))
    const unsubscribeDrivers = onSnapshot(driversQuery, (snapshot) => {
      const driverData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[]
      setDrivers(driverData)
    })

    return () => {
      unsubscribeServices()
      unsubscribeVehicles()
      unsubscribeDrivers()
    }
  }, [user])

  const getAnalytics = () => {
    const completedServices = allServices.filter((s) => s.status === "completed")
    const totalEarnings = completedServices.reduce((sum, s) => sum + (s.finalPrice || 0), 0)
    const avgRating =
      completedServices.length > 0
        ? completedServices.reduce((sum, s) => sum + (s.rating || 0), 0) / completedServices.length
        : 0
    const completionRate =
      allServices.length > 0 ? ((completedServices.length / allServices.length) * 100).toFixed(1) : "0"

    return {
      totalServices: allServices.length,
      completedServices: completedServices.length,
      totalEarnings,
      avgRating: avgRating.toFixed(1),
      completionRate,
    }
  }

  const analytics = getAnalytics()

  const serviceTypes = [
    { type: "Remolque", count: allServices.filter((s) => s.type === "towing").length },
    { type: "Batería", count: allServices.filter((s) => s.type === "battery").length },
    { type: "Rueda", count: allServices.filter((s) => s.type === "tire").length },
    { type: "Combustible", count: allServices.filter((s) => s.type === "fuel").length },
    { type: "Cerrajería", count: allServices.filter((s) => s.type === "lockout").length },
    { type: "Otros", count: allServices.filter((s) => s.type === "other").length },
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
                <p className="text-2xl font-bold text-auxy-navy">18 min</p>
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
                <p className="text-sm font-medium text-gray-600">Ganancias Totales</p>
                <p className="text-2xl font-bold text-auxy-navy">${analytics.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-auxy-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Tipos de Servicio</CardTitle>
            <CardDescription>Distribución de servicios por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceTypes.map((service) => (
                <div key={service.type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{service.type}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-auxy-navy">{service.count}</span>
                    <span className="text-xs text-gray-500">
                      ({analytics.totalServices > 0 ? ((service.count / analytics.totalServices) * 100).toFixed(1) : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-auxy-navy">Rendimiento de Flota</CardTitle>
            <CardDescription>Estadísticas de vehículos y conductores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vehículos totales:</span>
                <span className="font-medium text-auxy-navy">{vehicles.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conductores totales:</span>
                <span className="font-medium text-auxy-navy">{drivers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Servicios completados:</span>
                <span className="font-medium text-auxy-navy">{analytics.completedServices}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiencia operativa:</span>
                <span className="font-medium text-green-600">92%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
