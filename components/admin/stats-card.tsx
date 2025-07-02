"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  color: "red" | "blue" | "green" | "purple" | "orange" | "indigo"
}

const colorClasses = {
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    border: "border-red-200",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-200",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    border: "border-purple-200",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    border: "border-orange-200",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    border: "border-indigo-200",
  },
}

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  const classes = colorClasses[color]

  return (
    <Card className={`border-l-4 ${classes.border} hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${classes.bg}`}>
              <Icon className={`h-6 w-6 ${classes.icon}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-auxy-navy">{value}</p>
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <Badge
                variant="secondary"
                className={`${trend.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend.value)}%
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
