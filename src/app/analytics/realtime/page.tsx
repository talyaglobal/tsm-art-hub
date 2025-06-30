"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Users,
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  Wifi,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface RealTimeMetric {
  label: string
  value: string
  change: number
  icon: any
  color: string
}

interface LiveEvent {
  id: string
  type: "request" | "error" | "user" | "system"
  message: string
  timestamp: Date
  severity: "info" | "warning" | "error" | "success"
}

export default function AnalyticsRealtimePage() {
  const [isLive, setIsLive] = useState(true)
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    { label: "Requests/sec", value: "247", change: 12, icon: Activity, color: "text-blue-600" },
    { label: "Active Users", value: "1,247", change: 5, icon: Users, color: "text-green-600" },
    { label: "Response Time", value: "142ms", change: -8, icon: Clock, color: "text-purple-600" },
    { label: "Error Rate", value: "0.08%", change: -15, icon: AlertTriangle, color: "text-red-600" },
    { label: "CPU Usage", value: "67%", change: 3, icon: Server, color: "text-orange-600" },
    { label: "Memory Usage", value: "78%", change: -2, icon: Database, color: "text-indigo-600" },
  ])

  const [events, setEvents] = useState<LiveEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Update metrics with random variations
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: generateRandomValue(metric.label),
          change: Math.floor(Math.random() * 30) - 15, // -15 to +15
        })),
      )

      // Add new events
      const newEvent: LiveEvent = {
        id: Date.now().toString(),
        type: ["request", "error", "user", "system"][Math.floor(Math.random() * 4)] as any,
        message: generateRandomEvent(),
        timestamp: new Date(),
        severity: ["info", "warning", "error", "success"][Math.floor(Math.random() * 4)] as any,
      }

      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]) // Keep last 20 events
    }, 2000)

    return () => clearInterval(interval)
  }, [isLive])

  const generateRandomValue = (label: string): string => {
    switch (label) {
      case "Requests/sec":
        return (200 + Math.floor(Math.random() * 100)).toString()
      case "Active Users":
        return (1200 + Math.floor(Math.random() * 100)).toLocaleString()
      case "Response Time":
        return 120 + Math.floor(Math.random() * 50) + "ms"
      case "Error Rate":
        return (0.05 + Math.random() * 0.1).toFixed(2) + "%"
      case "CPU Usage":
        return 60 + Math.floor(Math.random() * 20) + "%"
      case "Memory Usage":
        return 70 + Math.floor(Math.random() * 20) + "%"
      default:
        return "0"
    }
  }

  const generateRandomEvent = (): string => {
    const events = [
      "New user registration from San Francisco",
      "API request to Shopify endpoint completed",
      "High response time detected on QuickBooks API",
      "Successful payment processed via Stripe",
      "Cache miss rate increased by 5%",
      "New integration added: WooCommerce",
      "Database query optimization completed",
      "SSL certificate renewed automatically",
      "Rate limit threshold reached for user ID 12345",
      "Backup process completed successfully",
    ]
    return events[Math.floor(Math.random() * events.length)]
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "request":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "user":
        return <Users className="h-4 w-4 text-green-600" />
      case "system":
        return <Server className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <span>Real-time Analytics</span>
            <Badge variant={isLive ? "default" : "secondary"} className="animate-pulse">
              <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? "bg-green-500" : "bg-gray-500"}`} />
              {isLive ? "LIVE" : "PAUSED"}
            </Badge>
          </h1>
          <p className="text-gray-600">Live system monitoring and real-time metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Wifi className={`h-4 w-4 ${connectionStatus === "connected" ? "text-green-600" : "text-red-600"}`} />
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>
          <Button variant={isLive ? "destructive" : "default"} onClick={() => setIsLive(!isLive)} size="sm">
            {isLive ? "Pause" : "Resume"} Live Updates
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon
          const TrendIcon = metric.change > 0 ? TrendingUp : TrendingDown
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-5 w-5 ${metric.color}`} />
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-3 w-3 ${metric.change > 0 ? "text-green-600" : "text-red-600"}`} />
                    <span className={`text-xs ${metric.change > 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
                {isLive && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent animate-pulse" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Activity Feed</span>
              <Badge variant="outline" className="ml-auto">
                {events.length} events
              </Badge>
            </CardTitle>
            <CardDescription>Real-time system events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getSeverityColor(event.severity)}`}>{event.message}</p>
                    <p className="text-xs text-gray-500">
                      {event.timestamp.toLocaleTimeString()} • {event.type}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for live events...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">API Gateway</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Cache Layer</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Load Balancer</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Health</span>
                  <span className="text-sm font-bold text-green-600">98.5%</span>
                </div>
                <Progress value={98.5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Live Performance Charts</CardTitle>
          <CardDescription>Real-time performance visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Live Request Volume Chart</p>
                <p className="text-xs text-gray-500">Updates every 2 seconds</p>
              </div>
            </div>
            <div className="h-48 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-gray-600">Live Response Time Chart</p>
                <p className="text-xs text-gray-500">Real-time performance tracking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
