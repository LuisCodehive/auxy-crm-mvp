"use client"

import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Vehicle, Driver } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Truck, User, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FleetManagementProps {
  vehicles: Vehicle[]
  drivers: Driver[]
}

export function FleetManagement({ vehicles, drivers }: FleetManagementProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showDriverForm, setShowDriverForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addVehicle = async (formData: FormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      const vehicleData = {
        providerId: user.id,
        type: formData.get("type") as string,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        licensePlate: formData.get("licensePlate") as string,
        status: "available",
        createdAt: new Date(),
      }

      await addDoc(collection(db, "vehicles"), vehicleData)

      toast({
        title: "Vehículo agregado",
        description: "El vehículo ha sido agregado a tu flota",
      })

      setShowVehicleForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el vehículo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addDriver = async (formData: FormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      const driverData = {
        providerId: user.id,
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        licenseNumber: formData.get("licenseNumber") as string,
        status: "available",
        createdAt: new Date(),
      }

      await addDoc(collection(db, "drivers"), driverData)

      toast({
        title: "Conductor agregado",
        description: "El conductor ha sido agregado a tu equipo",
      })

      setShowDriverForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el conductor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "default",
      busy: "secondary",
      maintenance: "destructive",
      offline: "outline",
    } as const

    const labels = {
      available: "Disponible",
      busy: "Ocupado",
      maintenance: "Mantenimiento",
      offline: "Desconectado",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehículos
                </CardTitle>
                <CardDescription>Gestiona tu flota de vehículos</CardDescription>
              </div>
              <Dialog open={showVehicleForm} onOpenChange={setShowVehicleForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Vehículo</DialogTitle>
                    <DialogDescription>Agrega un nuevo vehículo a tu flota</DialogDescription>
                  </DialogHeader>
                  <form action={addVehicle} className="space-y-4">
                    <div>
                      <Label htmlFor="type">Tipo de Vehículo</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tow_truck">Grúa</SelectItem>
                          <SelectItem value="technical">Técnico</SelectItem>
                          <SelectItem value="crane">Grúa Pesada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca</Label>
                      <Input id="brand" name="brand" required />
                    </div>
                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Input id="model" name="model" required />
                    </div>
                    <div>
                      <Label htmlFor="licensePlate">Patente</Label>
                      <Input id="licensePlate" name="licensePlate" required />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowVehicleForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? "Agregando..." : "Agregar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tienes vehículos registrados</p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                      <p className="text-xs text-gray-500">{vehicle.type}</p>
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Conductores
                </CardTitle>
                <CardDescription>Gestiona tu equipo de conductores</CardDescription>
              </div>
              <Dialog open={showDriverForm} onOpenChange={setShowDriverForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Conductor</DialogTitle>
                    <DialogDescription>Agrega un nuevo conductor a tu equipo</DialogDescription>
                  </DialogHeader>
                  <form action={addDriver} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" type="tel" required />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">Número de Licencia</Label>
                      <Input id="licenseNumber" name="licenseNumber" required />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDriverForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? "Agregando..." : "Agregar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {drivers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tienes conductores registrados</p>
            ) : (
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                      <p className="text-xs text-gray-500">Lic: {driver.licenseNumber}</p>
                    </div>
                    {getStatusBadge(driver.status)}
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
