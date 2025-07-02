"use client"

import type React from "react"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    companyName: (user as any)?.companyName || "",
    businessLicense: (user as any)?.businessLicense || "",
    serviceZones: ((user as any)?.serviceZones || []).join(", "),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        ...(user.role === "provider" && {
          companyName: formData.companyName,
          businessLicense: formData.businessLicense,
          serviceZones: formData.serviceZones
            .split(",")
            .map((zone) => zone.trim())
            .filter((zone) => zone),
        }),
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "users", user.id), updateData)

      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>Actualiza tu información personal y de empresa</DialogDescription>
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

          {user.role === "provider" && (
            <>
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessLicense">Licencia Comercial</Label>
                <Input
                  id="businessLicense"
                  value={formData.businessLicense}
                  onChange={(e) => handleChange("businessLicense", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceZones">Zonas de Servicio</Label>
                <Textarea
                  id="serviceZones"
                  value={formData.serviceZones}
                  onChange={(e) => handleChange("serviceZones", e.target.value)}
                  placeholder="Ej: Centro, Norte, Sur (separadas por comas)"
                  rows={3}
                />
              </div>
            </>
          )}

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
