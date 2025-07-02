"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Vehicle } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin } from "lucide-react"

export default function VehiclesPage() {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    const vehiclesUnsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const vehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setAllVehicles(vehicles)
      setFilteredVehicles(vehicles)
    })

    return vehiclesUnsubscribe
  }, [])

  useEffect(() => {
    let filtered = allVehicles

    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === typeFilter)
    }

    setFilteredVehicles(filtered)
  }, [allVehicles, searchTerm, statusFilter, typeFilter])

  const getStatusBadge = (status: string) => {
    const config = {
      available: { variant: "default" as const, className: "bg-green-100 text-green-800", label: "Disponible" },
      busy: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800", label: "Ocupado" },
      maintenance: { variant: "destructive" as const, className: "bg-red-100 text-red-800", label: "Mantenimiento" },
      offline: { variant: "outline" as const, className: "bg-gray-100 text-gray-800", label: "Desconectado" },
    }

    const statusConfig = config[status as keyof typeof config] || config.offline

    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-auxy-navy">{allVehicles.length}</p>
              <p className="text-sm text-gray-600">Total Vehículos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {allVehicles.filter((v) => v.status === "available").length}
              </p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {allVehicles.filter((v) => v.status === "busy").length}
              </p>
              <p className="text-sm text-gray-600">En Servicio</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {allVehicles.filter((v) => v.status === "maintenance").length}
              </p>
              <p className="text-sm text-gray-600">Mantenimiento</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Buscar por marca, modelo o patente..."
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
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="offline">Desconectado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="tow_truck">Grúa</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="crane">Grúa Pesada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Gestión de Vehículos</CardTitle>
          <CardDescription>
            Mostrando {filteredVehicles.length} de {allVehicles.length} vehículos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-medium text-auxy-navy">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">Patente: {vehicle.licensePlate}</p>
                  <p className="text-xs text-gray-500 capitalize">Tipo: {vehicle.type.replace("_", " ")}</p>
                  {vehicle.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(vehicle.status)}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="bg-auxy-red hover:bg-auxy-red-dark">
                      Rastrear
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
