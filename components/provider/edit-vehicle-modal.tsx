"use client"

import type React from "react"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Vehicle } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface EditVehicleModalProps {
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
}

export function EditVehicleModal({ vehicle, isOpen, onClose }: EditVehicleModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: vehicle.type,
    brand: vehicle.brand,
    model: vehicle.model,
    licensePlate: vehicle.licensePlate,
    status: vehicle.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateDoc(doc(db, "vehicles", vehicle.id), {
        ...formData,
        updatedAt: new Date(),
      })

      toast({
        title: "Vehículo actualizado",
        description: "Los datos del vehículo han sido actualizados correctamente",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el vehículo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
          <DialogDescription>
            Actualiza la información del vehículo {vehicle.brand} {vehicle.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Vehículo</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
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
            <Input id="brand" value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" value={formData.model} onChange={(e) => handleChange("model", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="licensePlate">Patente</Label>
            <Input
              id="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => handleChange("licensePlate", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="offline">Desconectado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-auxy-red hover:bg-auxy-red-dark">
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
