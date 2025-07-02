"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import type { ApiKey } from "@/lib/api-auth"

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showKeyValue, setShowKeyValue] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  const [newApiKey, setNewApiKey] = useState({
    name: "",
    permissions: [] as string[],
    rateLimit: 100,
    description: "",
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "apiKeys"))
      const keys = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastUsed: doc.data().lastUsed?.toDate(),
      })) as ApiKey[]

      setApiKeys(keys)
    } catch (error) {
      console.error("Error loading API keys:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las API keys",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = "auxy_"
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createApiKey = async () => {
    try {
      const apiKeyData = {
        ...newApiKey,
        key: generateApiKey(),
        isActive: true,
        createdAt: Timestamp.now(),
        usageCount: 0,
      }

      await addDoc(collection(db, "apiKeys"), apiKeyData)

      toast({
        title: "API Key creada",
        description: "La nueva API key ha sido creada exitosamente",
      })

      setShowCreateDialog(false)
      setNewApiKey({ name: "", permissions: [], rateLimit: 100, description: "" })
      loadApiKeys()
    } catch (error) {
      console.error("Error creating API key:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la API key",
        variant: "destructive",
      })
    }
  }

  const toggleApiKey = async (id: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "apiKeys", id), { isActive: !isActive })
      toast({
        title: isActive ? "API Key desactivada" : "API Key activada",
        description: `La API key ha sido ${isActive ? "desactivada" : "activada"}`,
      })
      loadApiKeys()
    } catch (error) {
      console.error("Error toggling API key:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la API key",
        variant: "destructive",
      })
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      await deleteDoc(doc(db, "apiKeys", id))
      toast({
        title: "API Key eliminada",
        description: "La API key ha sido eliminada permanentemente",
      })
      loadApiKeys()
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la API key",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "API key copiada al portapapeles",
    })
  }

  const toggleShowKey = (keyId: string) => {
    setShowKeyValue((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const availablePermissions = [
    { value: "*", label: "Todos los permisos" },
    { value: "requests:create", label: "Crear solicitudes" },
    { value: "requests:read", label: "Leer solicitudes" },
    { value: "requests:update", label: "Actualizar solicitudes" },
    { value: "requests:cancel", label: "Cancelar solicitudes" },
    { value: "providers:read", label: "Leer proveedores" },
    { value: "estimates:create", label: "Crear estimaciones" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600">Gestiona las claves de API para acceso externo</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear nueva API Key</DialogTitle>
              <DialogDescription>
                Crea una nueva clave de API para acceso externo a los servicios de Auxy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                  placeholder="Ej: App Móvil Principal"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newApiKey.description}
                  onChange={(e) => setNewApiKey({ ...newApiKey, description: e.target.value })}
                  placeholder="Describe el uso de esta API key..."
                />
              </div>
              <div>
                <Label htmlFor="rateLimit">Límite de requests por hora</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={newApiKey.rateLimit}
                  onChange={(e) => setNewApiKey({ ...newApiKey, rateLimit: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Permisos</Label>
                <div className="space-y-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.value}
                        checked={newApiKey.permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKey({
                              ...newApiKey,
                              permissions: [...newApiKey.permissions, permission.value],
                            })
                          } else {
                            setNewApiKey({
                              ...newApiKey,
                              permissions: newApiKey.permissions.filter((p) => p !== permission.value),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={permission.value} className="text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={createApiKey} disabled={!newApiKey.name}>
                Crear API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentación</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Activas</CardTitle>
              <CardDescription>Gestiona las claves de API para acceso a los servicios de Auxy</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{apiKey.name}</div>
                          <div className="text-sm text-gray-500">Creada: {apiKey.createdAt?.toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {showKeyValue[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 12)}...`}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => toggleShowKey(apiKey.id)}>
                            {showKeyValue[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{apiKey.usageCount || 0} requests</div>
                          <div className="text-gray-500">Límite: {apiKey.rateLimit}/hora</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={apiKey.isActive}
                            onCheckedChange={() => toggleApiKey(apiKey.id, apiKey.isActive)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentación de la API</CardTitle>
              <CardDescription>Información sobre cómo usar la API de Auxy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">URL Base</h3>
                <code className="bg-gray-100 px-3 py-2 rounded block">
                  {typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "/api/v1"}
                </code>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Autenticación</h3>
                <p className="text-sm text-gray-600 mb-2">Incluye tu API key en el header de autorización:</p>
                <code className="bg-gray-100 px-3 py-2 rounded block text-sm">Authorization: Bearer YOUR_API_KEY</code>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Endpoints Principales</h3>
                <div className="space-y-2">
                  <div className="border rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="default">POST</Badge>
                      <code>/requests</code>
                    </div>
                    <p className="text-sm text-gray-600">Crear nueva solicitud de auxilio</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code>/requests/{`{id}`}</code>
                    </div>
                    <p className="text-sm text-gray-600">Obtener estado de solicitud</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code>/providers</code>
                    </div>
                    <p className="text-sm text-gray-600">Buscar proveedores disponibles</p>
                  </div>
                </div>
              </div>

              <div>
                <Button asChild>
                  <a href="/api/v1/docs" target="_blank" rel="noreferrer">
                    Ver Documentación Completa
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
              <CardDescription>Monitoreo del uso de las API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {apiKeys.reduce((sum, key) => sum + (key.usageCount || 0), 0)}
                  </div>
                  <div className="text-sm text-blue-600">Total Requests</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {apiKeys.filter((key) => key.isActive).length}
                  </div>
                  <div className="text-sm text-green-600">API Keys Activas</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      apiKeys.filter(
                        (key) => key.lastUsed && new Date().getTime() - key.lastUsed.getTime() < 24 * 60 * 60 * 1000,
                      ).length
                    }
                  </div>
                  <div className="text-sm text-orange-600">Usadas Hoy</div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Las estadísticas detalladas de uso estarán disponibles próximamente.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
