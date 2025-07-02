"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      await signInWithEmailAndPassword(auth, email, password)
      toast({ title: "Inicio de sesión exitoso" })
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Verifica tus credenciales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const name = formData.get("name") as string
      const role = formData.get("role") as "client" | "provider"
      const phone = formData.get("phone") as string

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      const userData = {
        email,
        name,
        role,
        phone,
        createdAt: new Date(),
        isVerified: false,
        ...(role === "provider" && {
          companyName: formData.get("companyName") as string,
          businessLicense: formData.get("businessLicense") as string,
          serviceZones: [],
          isApproved: false,
          rating: 0,
          totalServices: 0,
        }),
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)

      toast({ title: "Registro exitoso" })
    } catch (error) {
      toast({
        title: "Error al registrarse",
        description: "Intenta nuevamente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-auxy-red rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-white" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            </div>
            <span className="text-2xl font-bold text-auxy-navy">Auxy</span>
          </div>
          <CardTitle className="text-auxy-navy">CRM Platform</CardTitle>
          <CardDescription>Plataforma de gestión de auxilio vehicular</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form action={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-auxy-red hover:bg-auxy-red-dark" disabled={isLoading}>
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form action={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div>
                  <Label htmlFor="role">Tipo de Usuario</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="provider">Empresa Prestadora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-auxy-red hover:bg-auxy-red-dark" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
