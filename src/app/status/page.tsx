"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Globe,
  Zap,
  RefreshCw,
  ExternalLink,
} from "lucide-react"

interface ServiceStatus {
  id: string
  name: string
  description: string
  status: "operational" | "degraded" | "outage" | "maintenance"
  uptime: number
  responseTime: number
  lastIncident?: string
  category: "core" | "api" | "database" | "external"
}

interface SystemMetrics {
  overallStatus: "operational" | "degraded" | "outage"
  uptime: number
  totalServices: number
  operationalServices: number
  incidents: number
  lastUpdated: string
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStatusData = () => {
      const mockServices: ServiceStatus[] = [
        {
          id: "api-gateway",
          name: "API Gateway",
          description: "Main API gateway handling all requests",
          status: "operational",
          uptime: 99.98,
          responseTime: 145,
          category: "core",
        },
        {
          id: "auth-service",
          name: "Authentication Service",
          description: "User authentication and authorization",
          status: "operational",
          uptime: 99.95,
          responseTime: 89,
          category: "core",
        },
        {
          id: "user-api",
          name: "User Management API",
          description: "User profile and account management",
          status: "operational",
          uptime: 99.92,
          responseTime: 156,
          category: "api",
        },
        {
          id: "analytics-api",
          name: "Analytics API",
          description: "Data analytics and reporting services",
          status: "degraded",
          uptime: 98.87,
          responseTime: 342,
          lastIncident: "2 hours ago",
          category: "api",
        },
        {
          id: "primary-db",
          name: "Primary Database",
          description: "Main PostgreSQL database cluster",
          status: "operational",
          uptime: 99.99,
          responseTime: 23,
          category: "database",
        },
        {
          id: "analytics-db",
          name: "Analytics Database",
          description: "Time-series database for analytics",
          status: "operational",
          uptime: 99.94,
          responseTime: 67,
          category: "database",
        },
        {
          id: "cdn",
          name: "Content Delivery Network",
          description: "Global CDN for static assets",
          status: "operational",
          uptime: 99.97,
          responseTime: 78,
          category: "external",
        },
        {
          id: "monitoring",
          name: "Monitoring System",
          description: "System monitoring and alerting",
          status: "maintenance",
          uptime: 99.85,
          responseTime: 234,
          lastIncident: "Scheduled maintenance",
          category: "core",
        },
      ]

      const mockMetrics: SystemMetrics = {
        overallStatus: "degraded",
        uptime: 99.91,
        totalServices: mockServices.length,
        operationalServices: mockServices.filter((s) => s.status === "operational").length,
        incidents: 1,
        lastUpdated: new Date().toLocaleString(),
      }

      setServices(mockServices)
      setMetrics(mockMetrics)
      setIsLoading(false)
    }

    setTimeout(loadStatusData, 800)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800"
      case "degraded":
        return "bg-yellow-100 text-yellow-800"
      case "outage":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "maintenance":
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "core":
        return <Server className="h-4 w-4" />
      case "api":
        return <Zap className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "external":
        return <Globe className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600"
    if (uptime >= 99.5) return "text-yellow-600"
    return "text-red-600"
  }

  const refresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMetrics((prev) => (prev ? { ...prev, lastUpdated: new Date().toLocaleString() } : null))
      setIsLoading(false)
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-600">Real-time status of all services and systems</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Subscribe to Updates
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {metrics && getStatusIcon(metrics.overallStatus)}
                <div>
                  <CardTitle className="text-2xl">
                    {metrics?.overallStatus === "operational"
                      ? "All Systems Operational"
                      : metrics?.overallStatus === "degraded"
                        ? "Some Systems Degraded"
                        : "System Outage"}
                  </CardTitle>
                  <CardDescription>Last updated: {metrics?.lastUpdated}</CardDescription>
                </div>
              </div>
              <Badge className={metrics ? getStatusColor(metrics.overallStatus) : "bg-gray-100 text-gray-800"}>
                {metrics?.overallStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics?.uptime}%</div>
                <p className="text-sm text-gray-600">Overall Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics?.operationalServices}/{metrics?.totalServices}
                </div>
                <p className="text-sm text-gray-600">Services Operational</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{metrics?.incidents}</div>
                <p className="text-sm text-gray-600">Active Incidents</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-sm text-gray-600">Scheduled Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Core Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-600" />
                Core Services
              </CardTitle>
              <CardDescription>Essential platform services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services
                .filter((service) => service.category === "core")
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {service.lastIncident && (
                          <p className="text-xs text-red-600">Last incident: {service.lastIncident}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      <p className={`text-sm font-medium ${getUptimeColor(service.uptime)}`}>
                        {service.uptime}% uptime
                      </p>
                      <p className="text-xs text-gray-500">{service.responseTime}ms avg</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* API Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-green-600" />
                API Services
              </CardTitle>
              <CardDescription>Application programming interfaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services
                .filter((service) => service.category === "api")
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {service.lastIncident && (
                          <p className="text-xs text-red-600">Last incident: {service.lastIncident}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      <p className={`text-sm font-medium ${getUptimeColor(service.uptime)}`}>
                        {service.uptime}% uptime
                      </p>
                      <p className="text-xs text-gray-500">{service.responseTime}ms avg</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Database & External Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Database Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Database Services
              </CardTitle>
              <CardDescription>Data storage and management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services
                .filter((service) => service.category === "database")
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {service.lastIncident && (
                          <p className="text-xs text-red-600">Last incident: {service.lastIncident}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      <p className={`text-sm font-medium ${getUptimeColor(service.uptime)}`}>
                        {service.uptime}% uptime
                      </p>
                      <p className="text-xs text-gray-500">{service.responseTime}ms avg</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* External Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-orange-600" />
                External Services
              </CardTitle>
              <CardDescription>Third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services
                .filter((service) => service.category === "external")
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {service.lastIncident && (
                          <p className="text-xs text-red-600">Last incident: {service.lastIncident}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      <p className={`text-sm font-medium ${getUptimeColor(service.uptime)}`}>
                        {service.uptime}% uptime
                      </p>
                      <p className="text-xs text-gray-500">{service.responseTime}ms avg</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Real-time system performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-gray-600">156ms avg</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Target: &lt;200ms</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Database Performance</span>
                  <span className="text-sm text-gray-600">23ms avg</span>
                </div>
                <Progress value={95} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Target: &lt;50ms</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-gray-600">0.02%</span>
                </div>
                <Progress value={2} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Target: &lt;0.1%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest system incidents and resolutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Analytics API Performance Degradation</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    We are currently investigating increased response times for the Analytics API. Some users may
                    experience slower loading times for analytics dashboards.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Started: 2 hours ago</span>
                    <span>•</span>
                    <span>Affected: Analytics API</span>
                    <span>•</span>
                    <span>Impact: Performance</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Scheduled Database Maintenance Completed</h4>
                    <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Scheduled maintenance on the primary database cluster has been completed successfully. All services
                    are now fully operational.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Resolved: 6 hours ago</span>
                    <span>•</span>
                    <span>Duration: 30 minutes</span>
                    <span>•</span>
                    <span>Impact: Minimal</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Monitoring System Maintenance</h4>
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Routine maintenance on our monitoring system is currently in progress. System status updates may be
                    delayed during this time.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Started: 1 hour ago</span>
                    <span>•</span>
                    <span>Expected duration: 2 hours</span>
                    <span>•</span>
                    <span>Impact: Monitoring only</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
