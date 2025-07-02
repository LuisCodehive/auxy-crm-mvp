"use client"

import type React from "react"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Driver } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface EditDriverModalProps {
  driver: Driver
  isOpen: boolean
  onClose: () => void
}

export function EditDriverModal({ driver, isOpen, onClose }: EditDriverModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: driver.name,
    phone: driver.phone,
    licenseNumber: driver.licenseNumber,
    status: driver.status,
    vehicleId: driver.vehicleId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updateData = {
        ...formData,
        vehicleId: formData.vehicleId || null,
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "drivers", driver.id), updateData)

      toast({
        title: "Conductor actualizado",
        description: "Los datos del conductor han sido actualizados correctamente",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el conductor",
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
          <DialogTitle>Editar Conductor</DialogTitle>
          <DialogDescription>Actualiza la información del conductor {driver.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="licenseNumber">Número de Licencia</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="vehicleId">Vehículo Asignado (Opcional)</Label>
            <Input
              id="vehicleId"
              value={formData.vehicleId}
              onChange={(e) => handleChange("vehicleId", e.target.value)}
              placeholder="ID del vehículo"
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
