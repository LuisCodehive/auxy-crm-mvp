"use client"

import { useState } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Trash2, CheckCircle, Bell, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

export function NotificationList() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || notification.type === typeFilter

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      (activeTab === "read" && notification.read)

    return matchesSearch && matchesType && matchesTab
  })

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)

    // Navegar según el tipo de notificación
    if (notification.data?.url) {
      router.push(notification.data.url)
    } else if (notification.data?.requestId) {
      // Determinar la URL basada en el rol del usuario
      router.push(`/requests/${notification.data.requestId}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "request":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "assignment":
        return <Bell className="h-5 w-5 text-purple-500" />
      case "completion":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "payment":
        return <Bell className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-auxy-navy">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="info">Información</SelectItem>
                <SelectItem value="success">Éxito</SelectItem>
                <SelectItem value="warning">Advertencia</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="request">Solicitud</SelectItem>
                <SelectItem value="assignment">Asignación</SelectItem>
                <SelectItem value="completion">Completado</SelectItem>
                <SelectItem value="payment">Pago</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-auxy-navy">Notificaciones</CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : "No tienes notificaciones sin leer"}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              Marcar todas como leídas
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">No leídas ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Leídas ({notifications.length - unreadCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hay notificaciones que coincidan con los filtros
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                          !notification.read ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
                            <div className="flex justify-between items-start">
                              <h3 className={`font-medium ${!notification.read ? "text-auxy-navy" : "text-gray-700"}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    Nueva
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {format(notification.createdAt, "dd MMM yyyy, HH:mm", { locale: es })}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
