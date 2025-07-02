"use client"

import { useState, useEffect } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notifyServiceRequest } from "@/lib/notification-service"

interface ServiceRequestFormProps {
  onClose: () => void
}

export function ServiceRequestForm({ onClose }: ServiceRequestFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Reverse geocoding to get address (simplified)
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

          setLocation({
            lat: latitude,
            lng: longitude,
            address,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación actual",
            variant: "destructive",
          })
        },
      )
    }
  }, [toast])

  const handleSubmit = async (formData: FormData) => {
    if (!user || !location) return

    setIsLoading(true)
    try {
      const type = formData.get("type") as string
      const description = formData.get("description") as string

      const serviceRequest = {
        clientId: user.id,
        type,
        description,
        location,
        status: "pending",
        createdAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "serviceRequests"), serviceRequest)

      // Enviar notificación al cliente
      await notifyServiceRequest(user.id, docRef.id, type)

      // Enviar notificaciones a los administradores (esto requeriría una consulta para obtener los IDs de los administradores)
      // Ejemplo: await notifyAdminsNewRequest(docRef.id, type)

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de auxilio ha sido enviada. Te contactaremos pronto.",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Auxilio</DialogTitle>
          <DialogDescription>Completa los datos para solicitar asistencia vehicular</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Problema</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de problema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="towing">Remolque</SelectItem>
                <SelectItem value="battery">Batería</SelectItem>
                <SelectItem value="tire">Rueda</SelectItem>
                <SelectItem value="fuel">Combustible</SelectItem>
                <SelectItem value="lockout">Cerrajería</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descripción del Problema</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe detalladamente el problema..."
              required
            />
          </div>

          <div>
            <Label>Ubicación Actual</Label>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{location ? location.address : "Obteniendo ubicación..."}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !location} className="flex-1">
              {isLoading ? "Enviando..." : "Solicitar Auxilio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
