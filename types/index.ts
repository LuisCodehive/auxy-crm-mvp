export interface User {
  id: string
  email: string
  role: "client" | "provider" | "admin" | "super_admin"
  name: string
  phone?: string
  createdAt: Date
  isVerified: boolean
}

export interface Client extends User {
  role: "client"
  location?: {
    lat: number
    lng: number
    address: string
  }
}

export interface Provider extends User {
  role: "provider"
  companyName: string
  businessLicense: string
  serviceZones: string[]
  isApproved: boolean
  rating: number
  totalServices: number
}

export interface Vehicle {
  id: string
  providerId: string
  type: "tow_truck" | "technical" | "crane"
  brand: string
  model: string
  licensePlate: string
  status: "available" | "busy" | "maintenance" | "offline"
  location?: {
    lat: number
    lng: number
  }
  driverId?: string
}

export interface Driver {
  id: string
  providerId: string
  name: string
  phone: string
  licenseNumber: string
  vehicleId?: string
  status: "available" | "busy" | "offline"
  location?: {
    lat: number
    lng: number
  }
}

export interface ServiceRequest {
  id: string
  clientId: string
  providerId?: string
  driverId?: string
  vehicleId?: string
  type: "towing" | "battery" | "tire" | "fuel" | "lockout" | "other"
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
  estimatedPrice?: number
  finalPrice?: number
  createdAt: Date
  assignedAt?: Date
  completedAt?: Date
  rating?: number
  feedback?: string
}

export interface ChatMessage {
  id: string
  serviceRequestId: string
  senderId: string
  senderRole: "client" | "provider" | "driver"
  message: string
  timestamp: Date
  type: "text" | "location" | "image"
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "request" | "assignment" | "completion" | "payment" | "system"
  read: boolean
  createdAt: Date
  data?: {
    requestId?: string
    providerId?: string
    driverId?: string
    vehicleId?: string
    url?: string
    [key: string]: any
  }
}
