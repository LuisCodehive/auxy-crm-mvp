"use client"

import type React from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  title: string
  subtitle?: string
}

export function AdminLayout({ children, activeTab, onTabChange, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-auxy-gray">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content */}
      <div className="ml-16 min-h-screen">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
