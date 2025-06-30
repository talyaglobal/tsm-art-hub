"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Server,
  TrendingDown,
  TrendingUp,
  Zap,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Eye,
  XCircle,
  AlertCircle,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: number
  responseTime: number
}

interface ServiceStatus {
  id: string
  name: string
  status: "healthy" | "warning" | "critical" | "down"
  uptime: number
  responseTime: number
  lastCheck: string
  endpoint: string
  region: string
}

interface Alert {
  id: string
  type: "performance" | "error" | "security" | "quota"
  severity: "info" | "warning" | "error" | "critical"
  title: string
  message: string
  timestamp: string
  service: string
  acknowledged: boolean
}

const performanceData = [
  { time: "00:00", cpu: 45, memory: 62, responseTime: 120 },
  { time: "04:00", cpu: 32, memory: 58, responseTime: 89 },
  { time: "08:00", cpu: 78, memory: 71, responseTime: 156 },
  { time: "12:00", cpu: 85, memory: 79, responseTime: 234 },
  { time: "16:00", cpu: 67, memory: 65, responseTime: 178 },
  { time: "20:00", cpu: 54, memory: 61, responseTime: 145 },
]

const uptimeData = [
  { date: "Jan 15", uptime: 99.9 },
  { date: "Jan 16", uptime: 99.8 },
  { date: "Jan 17", uptime: 100 },
  { date: "Jan 18", uptime: 99.7 },
  { date: "Jan 19", uptime: 99.9 },
  { date: "Jan 20", uptime: 99.8 },
  { date: "Jan 21", uptime: 100 },
]

export default function MonitorPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    responseTime: 0,
  })

  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [timeRange, setTimeRange] = useState("24h")
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const loadMonitoringData = () => {
      // Simulate real-time metrics
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 45, // 45-75%
        memory: Math.floor(Math.random() * 20) + 60, // 60-80%
        disk: Math.floor(Math.random() * 15) + 35, // 35-50%
        network: Math.floor(Math.random() * 40) + 20, // 20-60%
        uptime: 99.9,
        responseTime: Math.floor(Math.random() * 50) + 120, // 120-170ms
      })

      setServices([
        {
          id: "1",
          name: "API Gateway",
          status: "healthy",
          uptime: 99.9,
          responseTime: 145,
          lastCheck: "30 seconds ago",
          endpoint: "https://api.tsmarthub.com",
          region: "US-East",
        },
        {
          id: "2",
          name: "Database Cluster",
          status: "healthy",
          uptime: 99.8,
          responseTime: 23,
          lastCheck: "1 minute ago",
          endpoint: "postgresql://db.tsmarthub.com",
          region: "US-East",
        },
        {
          id: "3",
          name: "Redis Cache",
          status: "warning",
          uptime: 99.5,
          responseTime: 8,
          lastCheck: "45 seconds ago",
          endpoint: "redis://cache.tsmarthub.com",
          region: "US-East",
        },
        {
          id: "4",
          name: "Message Queue",
          status: "healthy",
          uptime: 99.7,
          responseTime: 12,
          lastCheck: "2 minutes ago",
          endpoint: "rabbitmq://queue.tsmarthub.com",
          region: "US-East",
        },
        {
          id: "5",
          name: "File Storage",
          status: "critical",
          uptime: 98.2,
          responseTime: 456,
          lastCheck: "5 minutes ago",
          endpoint: "s3://storage.tsmarthub.com",
          region: "US-West",
        },
      ])

      setAlerts([
        {
          id: "1",
          type: "performance",
          severity: "warning",
          title: "High Response Time",
          message: "File Storage service response time exceeded 400ms threshold",
          timestamp: "2024-01-20 14:32:15",
          service: "File Storage",
          acknowledged: false,
        },
        {
          id: "2",
          type: "quota",
          severity: "info",
          title: "API Rate Limit",
          message: "Shopify API approaching rate limit (80% of quota used)",
          timestamp: "2024-01-20 14:28:42",
          service: "Shopify Integration",
          acknowledged: true,
        },
        {
          id: "3",
          type: "error",
          severity: "error",
          title: "Connection Timeout",
          message: "Redis Cache connection timeout detected",
          timestamp: "2024-01-20 14:15:33",
          service: "Redis Cache",
          acknowledged: false,
        },
        {
          id: "4",
          type: "security",
          severity: "critical",
          title: "Suspicious Activity",
          message: "Multiple failed authentication attempts from IP 192.168.1.100",
          timestamp: "2024-01-20 13:45:21",
          service: "API Gateway",
          acknowledged: false,
        },
      ])

      setIsLoading(false)
      setLastUpdate(new Date())
    }

    loadMonitoringData()
    const interval = setInterval(loadMonitoringData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "critical":
        return "text-red-600 bg-red-100"
      case "down":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "down":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "critical":
        return "bg-red-200 text-red-900"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-600"
    if (value >= thresholds.warning) return "text-yellow-600"
    return "text-green-600"
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsLoading(false)
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
              <p className="text-gray-600">Real-time system health and performance monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.cpu}%</div>
                  <Progress value={metrics.cpu} className="mt-2" />
                  <p className={`text-xs mt-1 ${getMetricColor(metrics.cpu, { warning: 70, critical: 85 })}`}>
                    {metrics.cpu < 70 ? "Normal" : metrics.cpu < 85 ? "High" : "Critical"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.memory}%</div>
                  <Progress value={metrics.memory} className="mt-2" />
                  <p className={`text-xs mt-1 ${getMetricColor(metrics.memory, { warning: 75, critical: 90 })}`}>
                    {metrics.memory < 75 ? "Normal" : metrics.memory < 90 ? "High" : "Critical"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                  <Network className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.network}%</div>
                  <Progress value={metrics.network} className="mt-2" />
                  <p className="text-xs text-green-600 mt-1">Normal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Heart className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.uptime}%</div>
                  <Progress value={metrics.uptime} className="mt-2" />
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Excellent
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Service Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2 text-blue-600" />
                    Service Health
                  </CardTitle>
                  <CardDescription>Current status of all monitored services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(service.status)}
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.lastCheck}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Services
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    System Uptime
                  </CardTitle>
                  <CardDescription>7-day uptime history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={uptimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[99, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="uptime" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {getStatusIcon(service.status)}
                    </div>
                    <CardDescription>{service.endpoint}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">{service.region}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Uptime</p>
                          <p className="font-medium">{service.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Response Time</p>
                          <p className="font-medium">{service.responseTime}ms</p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-500">Last Check</p>
                        <p className="font-medium">{service.lastCheck}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>CPU and Memory usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
                      <Line type="monotone" dataKey="memory" stroke="#10B981" name="Memory %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                  <CardDescription>Average response time throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="responseTime" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -12ms from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                  <Zap className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    req/min
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.12%</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -0.05% improvement
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Active Alerts</h3>
                <p className="text-gray-600">
                  {alerts.filter((alert) => !alert.acknowledged).length} unacknowledged alerts
                </p>
              </div>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${alert.acknowledged ? "opacity-60" : ""}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                          {alert.acknowledged && <Badge variant="outline">Acknowledged</Badge>}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Service: {alert.service}</span>
                          <span>Time: {alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alert.acknowledged && (
                          <Button variant="outline" size="sm">
                            Acknowledge
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
