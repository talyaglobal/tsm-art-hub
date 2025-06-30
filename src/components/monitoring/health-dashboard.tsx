"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw, Bell } from "lucide-react"
import type { SystemHealth, Alert as AlertType, HealthMetric } from "@/types/monitoring"

interface HealthDashboardProps {
  apiId?: string
  refreshInterval?: number
}

export function HealthDashboard({ apiId, refreshInterval = 30000 }: HealthDashboardProps) {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, refreshInterval)
    return () => clearInterval(interval)
  }, [apiId, refreshInterval])

  const fetchHealthData = async () => {
    try {
      setLoading(true)

      // Fetch health data
      const healthResponse = await fetch(apiId ? `/api/monitoring/health/${apiId}` : "/api/monitoring/health")
      const healthData = await healthResponse.json()

      if (healthData.success) {
        setHealth(healthData.data)
      }

      // Fetch active alerts
      const alertsResponse = await fetch("/api/monitoring/alerts?status=active")
      const alertsData = await alertsResponse.json()

      if (alertsData.success) {
        setAlerts(alertsData.data)
      }

      // Fetch recent metrics
      const metricsResponse = await fetch(apiId ? `/api/monitoring/metrics/${apiId}` : "/api/monitoring/metrics")
      const metricsData = await metricsResponse.json()

      if (metricsData.success) {
        setMetrics(metricsData.data)
      }

      setLastRefresh(new Date())
    } catch (error) {
      console.error("Failed to fetch health data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "critical":
        return "text-red-600 bg-red-100"
      case "degraded":
        return "text-orange-600 bg-orange-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (loading && !health) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <Button onClick={fetchHealthData} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {alerts.length} active alert{alerts.length > 1 ? "s" : ""} require attention
              </span>
              <Button variant="outline" size="sm">
                View All Alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {getStatusIcon(health?.overall_status || "unknown")}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(health?.overall_status || "unknown")}>
              {health?.overall_status || "Unknown"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.uptime || 0}%</div>
            <Progress value={health?.uptime || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.response_time || 0}ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.error_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Component Health */}
      {health?.components && health.components.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Component Health</CardTitle>
            <CardDescription>Status of individual system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health.components.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(component.status)}
                    <div>
                      <p className="font-medium">{component.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last check: {new Date(component.last_check).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {component.response_time && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">RT:</span> {component.response_time}ms
                      </div>
                    )}
                    <Badge className={getStatusColor(component.status)}>{component.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Metrics */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{metric.name}</p>
                    <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                  </div>
                  <div className="text-2xl font-bold">
                    {metric.value} {metric.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(metric.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
