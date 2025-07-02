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
  Truck,
  MapPin,
  Settings,
  Bell,
  Users,
  LogOut,
  User,
  ChevronRight,
  Home,
  Activity,
  DollarSign,
  FileText,
} from "lucide-react"
import { EditProfileModal } from "./edit-profile-modal"

interface ProviderSidebarProps {
  activeTab: string
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    badge: null,
    href: "/provider",
  },
  {
    id: "requests",
    label: "Solicitudes",
    icon: Activity,
    badge: "8",
    href: "/provider/requests",
  },
  {
    id: "fleet",
    label: "Flota",
    icon: Truck,
    badge: null,
    href: "/provider/fleet",
  },
  {
    id: "services",
    label: "Servicios",
    icon: FileText,
    badge: null,
    href: "/provider/services",
  },
  {
    id: "drivers",
    label: "Conductores",
    icon: Users,
    badge: null,
    href: "/provider/drivers",
  },
  {
    id: "analytics",
    label: "Analíticas",
    icon: BarChart3,
    badge: null,
    href: "/provider/analytics",
  },
  {
    id: "earnings",
    label: "Ganancias",
    icon: DollarSign,
    badge: null,
    href: "/provider/earnings",
  },
  {
    id: "zones",
    label: "Zonas",
    icon: MapPin,
    badge: null,
    href: "/provider/zones",
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: Bell,
    badge: "3",
    href: "/provider/notifications",
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    badge: null,
    href: "/provider/settings",
  },
]

export function ProviderSidebar({ activeTab }: ProviderSidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <TooltipProvider>
      <div
        className={`fixed left-0 top-0 h-full bg-auxy-navy border-r border-auxy-navy-light transition-all duration-300 z-40 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-auxy-navy-light">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-auxy-red rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-white" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            </div>
            {isExpanded && <span className="text-white font-bold text-xl">Auxy</span>}
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
                          ? "bg-auxy-red text-white hover:bg-auxy-red-dark"
                          : "text-gray-300 hover:bg-auxy-navy-light hover:text-white"
                      } ${!isExpanded ? "justify-center" : ""}`}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className={`h-5 w-5 ${isExpanded ? "mr-3" : ""}`} />
                      {isExpanded && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto bg-auxy-red-light text-auxy-red-dark text-xs">
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
                        <Badge variant="secondary" className="bg-auxy-red text-white">
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
        <div className="border-t border-auxy-navy-light p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full h-12 text-gray-300 hover:bg-auxy-navy-light hover:text-white ${
                  !isExpanded ? "justify-center px-3" : "justify-start px-3"
                }`}
              >
                <Avatar className={`h-8 w-8 ${isExpanded ? "mr-3" : ""}`}>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-auxy-red text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">Proveedor</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation("/provider/settings")}>
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
        <EditProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      </div>
    </TooltipProvider>
  )
}
