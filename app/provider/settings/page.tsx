"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EditProfileModal } from "@/components/provider/edit-profile-modal"
import { User, Building, Shield, Bell, Key, CreditCard } from "lucide-react"

export default function ProviderSettingsPage() {
  const { user } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-auxy-navy">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Gestiona tu información personal y de contacto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-auxy-navy">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-auxy-navy">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Teléfono</p>
              <p className="text-auxy-navy">{user.phone || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <Badge className={user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {user.isVerified ? "Verificado" : "Pendiente"}
              </Badge>
            </div>
          </div>
          <Button onClick={() => setShowProfileModal(true)} className="bg-auxy-red hover:bg-auxy-red-dark">
            Editar Información
          </Button>
        </CardContent>
      </Card>

      {/* Company Information */}
      {user.role === "provider" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-auxy-navy">
              <Building className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
            <CardDescription>Datos de tu empresa prestadora de servicios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre de la Empresa</p>
                <p className="text-auxy-navy">{(user as any).companyName || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Licencia Comercial</p>
                <p className="text-auxy-navy">{(user as any).businessLicense || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estado de Aprobación</p>
                <Badge
                  className={(user as any).isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {(user as any).isApproved ? "Aprobado" : "Pendiente de Aprobación"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-auxy-navy">{(user as any).rating || 0}/5 ⭐</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Zonas de Servicio</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {((user as any).serviceZones || []).length > 0 ? (
                  ((user as any).serviceZones || []).map((zone: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {zone}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No hay zonas especificadas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-auxy-navy">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>Configuración de seguridad de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Cambiar Contraseña</p>
              <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
            </div>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Autenticación de Dos Factores</p>
              <p className="text-sm text-gray-600">Agrega una capa extra de seguridad</p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-auxy-navy">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Nuevas Solicitudes</p>
              <p className="text-sm text-gray-600">Recibe notificaciones de nuevas solicitudes</p>
            </div>
            <Button variant="outline" size="sm">
              Activado
            </Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Actualizaciones de Servicios</p>
              <p className="text-sm text-gray-600">Notificaciones sobre el estado de servicios</p>
            </div>
            <Button variant="outline" size="sm">
              Activado
            </Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Reportes Semanales</p>
              <p className="text-sm text-gray-600">Resumen semanal de actividad</p>
            </div>
            <Button variant="outline" size="sm">
              Desactivado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-auxy-navy">
            <CreditCard className="h-5 w-5" />
            Facturación
          </CardTitle>
          <CardDescription>Información de facturación y pagos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Método de Pago</p>
              <p className="text-sm text-gray-600">Tarjeta terminada en ****1234</p>
            </div>
            <Button variant="outline">Actualizar</Button>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Historial de Facturación</p>
              <p className="text-sm text-gray-600">Ver facturas anteriores</p>
            </div>
            <Button variant="outline">Ver Historial</Button>
          </div>
        </CardContent>
      </Card>

      <EditProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  )
}
