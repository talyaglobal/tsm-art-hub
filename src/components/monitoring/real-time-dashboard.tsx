"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Server,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Settings,
  Bell,
  CheckCircle,
  Pause,
  Play,
} from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface RealTimeMetrics {
  timestamp: string
  apiCalls: number
  errorRate: number
  avgResponseTime: number
  activeConnections: number
  throughput: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIn: number
  networkOut: number
}

interface AlertData {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  source: string
}

interface ServiceHealth {
  name: string
  status: "healthy" | "degraded" | "down"
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: string
}

export function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetrics[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [services, setServices] = useState<ServiceHealth[]>([])
  const [isLive, setIsLive] = useState(true)
  const [timeRange, setTimeRange] = useState("1h")
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const [selectedMetric, setSelectedMetric] = useState("apiCalls")
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadInitialData()
    if (isLive) {
      startRealTimeUpdates()
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLive, refreshInterval])

  const loadInitialData = async () => {
    // Load initial metrics data
    const initialMetrics = generateMockMetrics(50)
    setMetrics(initialMetrics)

    // Load alerts
    const mockAlerts: AlertData[] = [
      {
        id: "1",
        type: "critical",
        title: "High Error Rate",
        message: "API error rate exceeded 5% threshold",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        acknowledged: false,
        source: "API Gateway",
      },
      {
        id: "2",
        type: "warning",
        title: "High Response Time",
        message: "Average response time increased to 2.5s",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        acknowledged: false,
        source: "Load Balancer",
      },
      {
        id: "3",
        type: "info",
        title: "Deployment Complete",
        message: "Version 2.1.0 deployed successfully",
        timestamp: new Date(Date.now() - 900000).toISOString(),
        acknowledged: true,
        source: "CI/CD Pipeline",
      },
    ]
    setAlerts(mockAlerts)

    // Load service health
    const mockServices: ServiceHealth[] = [
      {
        name: "API Gateway",
        status: "healthy",
        uptime: 99.9,
        responseTime: 120,
        errorRate: 0.1,
        lastCheck: new Date().toISOString(),
      },
      {
        name: "Database",
        status: "healthy",
        uptime: 99.8,
        responseTime: 45,
        errorRate: 0.05,
        lastCheck: new Date().toISOString(),
      },
      {
        name: "Integration Service",
        status: "degraded",
        uptime: 98.5,
        responseTime: 350,
        errorRate: 2.1,
        lastCheck: new Date().toISOString(),
      },
      {
        name: "Authentication Service",
        status: "healthy",
        uptime: 99.95,
        responseTime: 80,
        errorRate: 0.02,
        lastCheck: new Date().toISOString(),
      },
    ]
    setServices(mockServices)
  }

  const startRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const newMetric = generateMockMetrics(1)[0]
      setMetrics((prev) => {
        const updated = [...prev, newMetric]
        return updated.slice(-100) // Keep last 100 data points
      })

      // Randomly update service health
      if (Math.random() < 0.1) {
        setServices((prev) =>
          prev.map((service) => ({
            ...service,
            responseTime: service.responseTime + (Math.random() - 0.5) * 50,
            errorRate: Math.max(0, service.errorRate + (Math.random() - 0.5) * 0.5),
            lastCheck: new Date().toISOString(),
          })),
        )
      }
    }, refreshInterval)
  }

  const generateMockMetrics = (count: number): RealTimeMetrics[] => {
    const now = Date.now()
    return Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(now - (count - 1 - i) * 5000).toISOString(),
      apiCalls: Math.floor(Math.random() * 1000) + 500,
      errorRate: Math.random() * 5,
      avgResponseTime: Math.random() * 500 + 100,
      activeConnections: Math.floor(Math.random() * 200) + 50,
      throughput: Math.random() * 10000 + 5000,
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkIn: Math.random() * 1000,
      networkOut: Math.random() * 1000,
    }))
  }

  const toggleLiveUpdates = () => {
    setIsLive(!isLive)
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "degraded":
        return "text-yellow-600 bg-yellow-100"
      case "down":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-500 bg-red-50"
      case "warning":
        return "border-yellow-500 bg-yellow-50"
      case "info":
        return "border-blue-500 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  }

  const currentMetrics = metrics[metrics.length - 1] || {
    apiCalls: 0,
    errorRate: 0,
    avgResponseTime: 0,
    activeConnections: 0,
    throughput: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIn: 0,
    networkOut: 0,
  }

  const chartData = {
    labels: metrics.map((_, i) => i),
    datasets: [
      {
        data: metrics.map((m) => m[selectedMetric as keyof RealTimeMetrics]),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Real-Time Dashboard</h2>
          <Badge variant={isLive ? "default" : "secondary"} className="flex items-center space-x-1">
            {isLive ? <Activity className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span>{isLive ? "Live" : "Paused"}</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
            </SelectContent>
          </Select>

          <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 second</SelectItem>
              <SelectItem value="5000">5 seconds</SelectItem>
              <SelectItem value="10000">10 seconds</SelectItem>
              <SelectItem value="30000">30 seconds</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={toggleLiveUpdates}>
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedMetric("apiCalls")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls/min</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.apiCalls.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedMetric("errorRate")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.errorRate.toFixed(2)}%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.3%
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedMetric("avgResponseTime")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(currentMetrics.avgResponseTime)}ms</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -5.2%
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedMetric("activeConnections")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.activeConnections}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.1%
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedMetric("throughput")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(currentMetrics.throughput / 1000).toFixed(1)}K/s</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3%
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedMetric("cpuUsage")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Server className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(currentMetrics.cpuUsage)}%</div>
            <Progress value={currentMetrics.cpuUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Real-Time Metrics</CardTitle>
              <CardDescription>
                Showing {selectedMetric.replace(/([A-Z])/g, " $1").toLowerCase()} over time
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apiCalls">API Calls</SelectItem>
                  <SelectItem value="errorRate">Error Rate</SelectItem>
                  <SelectItem value="avgResponseTime">Response Time</SelectItem>
                  <SelectItem value="activeConnections">Active Connections</SelectItem>
                  <SelectItem value="throughput">Throughput</SelectItem>
                  <SelectItem value="cpuUsage">CPU Usage</SelectItem>
                  <SelectItem value="memoryUsage">Memory Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Service Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        service.status === "healthy"
                          ? "bg-green-500"
                          : service.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">
                        {service.responseTime}ms • {service.errorRate.toFixed(2)}% errors
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{service.uptime.toFixed(1)}% uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Alerts
              </CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.type === "critical" ? "destructive" : "secondary"}>{alert.type}</Badge>
                        <span className="text-xs text-gray-500">{alert.source}</span>
                      </div>
                      <h4 className="font-medium mt-1">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.acknowledged ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                          Ack
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(currentMetrics.cpuUsage)}%</div>
            <Progress value={currentMetrics.cpuUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(currentMetrics.memoryUsage)}%</div>
            <Progress value={currentMetrics.memoryUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(currentMetrics.diskUsage)}%</div>
            <Progress value={currentMetrics.diskUsage} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
