"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BarChart3,
  Users,
  Truck,
  Settings,
  Bell,
  FileText,
  Shield,
  LogOut,
  User,
  ChevronRight,
  Activity,
  Crown,
  Key,
  Server,
  UserCheck,
} from "lucide-react"

interface SuperAdminSidebarProps {
  activeTab: string
}

const menuItems = [
  {
    id: "dashboard",
    label: "Super Dashboard",
    icon: Crown,
    badge: null,
    href: "/super-admin",
  },
  {
    id: "clients",
    label: "Clientes",
    icon: Users,
    badge: null,
    href: "/super-admin/clients",
  },
  {
    id: "providers",
    label: "Proveedores",
    icon: Shield,
    badge: "3",
    href: "/super-admin/providers",
  },
  {
    id: "requests",
    label: "Solicitudes",
    icon: Activity,
    badge: "25",
    href: "/super-admin/requests",
  },
  {
    id: "vehicles",
    label: "Vehículos",
    icon: Truck,
    badge: null,
    href: "/super-admin/vehicles",
  },
  {
    id: "drivers",
    label: "Conductores",
    icon: UserCheck,
    badge: null,
    href: "/super-admin/drivers",
  },
  {
    id: "analytics",
    label: "Analíticas",
    icon: BarChart3,
    badge: null,
    href: "/super-admin/analytics",
  },
  {
    id: "reports",
    label: "Reportes",
    icon: FileText,
    badge: null,
    href: "/super-admin/reports",
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: Key,
    badge: "5",
    href: "/super-admin/api-keys",
  },
  {
    id: "system",
    label: "Sistema",
    icon: Server,
    badge: null,
    href: "/super-admin/system",
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: Bell,
    badge: "12",
    href: "/super-admin/notifications",
  },
]

export function SuperAdminSidebar({ activeTab }: SuperAdminSidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <TooltipProvider>
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-900 to-purple-800 border-r border-purple-700 transition-all duration-300 z-40 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-purple-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-sm flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            {isExpanded && <span className="text-white font-bold text-xl">Super Admin</span>}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-12 px-3 text-left transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
                          : "text-purple-200 hover:bg-purple-700 hover:text-white"
                      } ${!isExpanded ? "justify-center" : ""}`}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className={`h-5 w-5 ${isExpanded ? "mr-3" : ""}`} />
                      {isExpanded && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-yellow-400 text-purple-900 text-xs font-bold"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="bg-yellow-400 text-purple-900">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-purple-700 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full h-12 text-purple-200 hover:bg-purple-700 hover:text-white ${
                  !isExpanded ? "justify-center px-3" : "justify-start px-3"
                }`}
              >
                <Avatar className={`h-8 w-8 ${isExpanded ? "mr-3" : ""}`}>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-purple-300 truncate">Super Administrador</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation("/super-admin/system")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
