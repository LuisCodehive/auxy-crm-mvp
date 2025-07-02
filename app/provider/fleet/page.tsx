"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Vehicle, Driver } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FleetManagement } from "@/components/dashboard/fleet-management"
import { Search, Filter, Truck, Users, MapPin } from "lucide-react"
import { EditVehicleModal } from "@/components/provider/edit-vehicle-modal"
import { EditDriverModal } from "@/components/provider/edit-driver-modal"
import { DeleteConfirmationModal } from "@/components/provider/delete-confirmation-modal"

export default function ProviderFleetPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [deletingItem, setDeletingItem] = useState<{
    type: "vehicle" | "driver"
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    if (!user) return

    // Listen to vehicles
    const vehiclesQuery = query(collection(db, "vehicles"), where("providerId", "==", user.id))
    const unsubscribeVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
      const vehicleData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vehicle[]
      setVehicles(vehicleData)
      setFilteredVehicles(vehicleData)
    })

    // Listen to drivers
    const driversQuery = query(collection(db, "drivers"), where("providerId", "==", user.id))
    const unsubscribeDrivers = onSnapshot(driversQuery, (snapshot) => {
      const driverData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[]
      setDrivers(driverData)
      setFilteredDrivers(driverData)
    })

    return () => {
      unsubscribeVehicles()
      unsubscribeDrivers()
    }
  }, [user])

  useEffect(() => {
    // Filter vehicles
    let filtered = vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      return matchesSearch && matchesStatus
    })
    setFilteredVehicles(filtered)

    // Filter drivers
    filtered = drivers.filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter
      return matchesSearch && matchesStatus
    })
    setFilteredDrivers(filtered)
  }, [vehicles, drivers, searchTerm, statusFilter])

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
              <p className="text-2xl font-bold text-auxy-navy">{vehicles.length}</p>
              <p className="text-sm text-gray-600">Total Vehículos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {vehicles.filter((v) => v.status === "available").length}
              </p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-auxy-navy">{drivers.length}</p>
              <p className="text-sm text-gray-600">Total Conductores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {drivers.filter((d) => d.status === "available").length}
              </p>
              <p className="text-sm text-gray-600">Conductores Libres</p>
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
                placeholder="Buscar vehículos o conductores..."
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
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehículos ({filteredVehicles.length})
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Conductores ({filteredDrivers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FleetManagement vehicles={vehicles} drivers={drivers} />
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Gestión de Vehículos</CardTitle>
              <CardDescription>
                Mostrando {filteredVehicles.length} de {vehicles.length} vehículos
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
                        <Button size="sm" variant="outline" onClick={() => setEditingVehicle(vehicle)}>
                          Editar
                        </Button>
                        <Button size="sm" className="bg-auxy-red hover:bg-auxy-red-dark">
                          Rastrear
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            setDeletingItem({
                              type: "vehicle",
                              id: vehicle.id,
                              name: `${vehicle.brand} ${vehicle.model}`,
                            })
                          }
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle className="text-auxy-navy">Gestión de Conductores</CardTitle>
              <CardDescription>
                Mostrando {filteredDrivers.length} de {drivers.length} conductores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-auxy-navy">{driver.name}</p>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                      <p className="text-xs text-gray-500">Licencia: {driver.licenseNumber}</p>
                      {driver.vehicleId && (
                        <p className="text-xs text-gray-400">Vehículo asignado: {driver.vehicleId}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(driver.status)}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingDriver(driver)}>
                          Editar
                        </Button>
                        <Button size="sm" className="bg-auxy-red hover:bg-auxy-red-dark">
                          Contactar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            setDeletingItem({
                              type: "driver",
                              id: driver.id,
                              name: driver.name,
                            })
                          }
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {editingVehicle && (
        <EditVehicleModal vehicle={editingVehicle} isOpen={!!editingVehicle} onClose={() => setEditingVehicle(null)} />
      )}

      {editingDriver && (
        <EditDriverModal driver={editingDriver} isOpen={!!editingDriver} onClose={() => setEditingDriver(null)} />
      )}
      {deletingItem && (
        <DeleteConfirmationModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          itemType={deletingItem.type}
          itemId={deletingItem.id}
          itemName={deletingItem.name}
        />
      )}
    </div>
  )
}
