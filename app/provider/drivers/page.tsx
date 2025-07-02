"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Driver } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Phone, MapPin } from "lucide-react"
import { EditDriverModal } from "@/components/provider/edit-driver-modal"
import { DeleteConfirmationModal } from "@/components/provider/delete-confirmation-modal"

export default function ProviderDriversPage() {
  const { user } = useAuth()
  const [allDrivers, setAllDrivers] = useState<Driver[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [deletingDriver, setDeletingDriver] = useState<{
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    if (!user) return

    const driversQuery = query(collection(db, "drivers"), where("providerId", "==", user.id))
    const unsubscribe = onSnapshot(driversQuery, (snapshot) => {
      const drivers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[]
      setAllDrivers(drivers)
      setFilteredDrivers(drivers)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    let filtered = allDrivers

    if (searchTerm) {
      filtered = filtered.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.phone.includes(searchTerm) ||
          driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((driver) => driver.status === statusFilter)
    }

    setFilteredDrivers(filtered)
  }, [allDrivers, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const config = {
      available: { className: "bg-green-100 text-green-800", label: "Disponible" },
      busy: { className: "bg-blue-100 text-blue-800", label: "Ocupado" },
      offline: { className: "bg-gray-100 text-gray-800", label: "Desconectado" },
    }

    const statusConfig = config[status as keyof typeof config] || config.offline

    return (
      <Badge variant="secondary" className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-auxy-navy">{allDrivers.length}</p>
              <p className="text-sm text-gray-600">Total Conductores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {allDrivers.filter((d) => d.status === "available").length}
              </p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{allDrivers.filter((d) => d.status === "busy").length}</p>
              <p className="text-sm text-gray-600">En Servicio</p>
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
                placeholder="Buscar por nombre, teléfono o licencia..."
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
                <SelectItem value="offline">Desconectado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Gestión de Conductores</CardTitle>
          <CardDescription>
            Mostrando {filteredDrivers.length} de {allDrivers.length} conductores
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
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {driver.phone}
                  </p>
                  <p className="text-xs text-gray-500">Licencia: {driver.licenseNumber}</p>
                  {driver.vehicleId && <p className="text-xs text-gray-400">Vehículo asignado: {driver.vehicleId}</p>}
                  {driver.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {driver.location.lat.toFixed(4)}, {driver.location.lng.toFixed(4)}
                    </p>
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
                        setDeletingDriver({
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
      {editingDriver && (
        <EditDriverModal driver={editingDriver} isOpen={!!editingDriver} onClose={() => setEditingDriver(null)} />
      )}
      {deletingDriver && (
        <DeleteConfirmationModal
          isOpen={!!deletingDriver}
          onClose={() => setDeletingDriver(null)}
          itemType="driver"
          itemId={deletingDriver.id}
          itemName={deletingDriver.name}
        />
      )}
    </div>
  )
}
