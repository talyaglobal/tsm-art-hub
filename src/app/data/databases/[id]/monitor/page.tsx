"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  Activity,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  Users,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

interface DatabaseMetrics {
  id: string
  name: string
  type: string
  status: "connected" | "disconnected" | "error"
  host: string
  port: number
  connections: {
    active: number
    idle: number
    max: number
  }
  performance: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  queries: {
    total: number
    successful: number
    failed: number
    avgResponseTime: number
  }
  storage: {
    size: string
    used: number
    available: number
  }
  uptime: string
  version: string
  lastBackup: string
}

export default function DatabaseMonitorPage() {
  const params = useParams()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [database, setDatabase] = useState<DatabaseMetrics>({
    id: params.id as string,
    name: "Primary PostgreSQL",
    type: "postgresql",
    status: "connected",
    host: "db-primary.tsmarthub.com",
    port: 5432,
    connections: {
      active: 45,
      idle: 15,
      max: 100,
    },
    performance: {
      cpu: 65,
      memory: 78,
      disk: 45,
      network: 32,
    },
    queries: {
      total: 15420,
      successful: 15398,
      failed: 22,
      avgResponseTime: 125,
    },
    storage: {
      size: "2.4 GB",
      used: 65,
      available: 35,
    },
    uptime: "99.9%",
    version: "14.2",
    lastBackup: "2 hours ago",
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "disconnected":
        return <XCircle className="h-5 w-5 text-gray-600" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800"
      case "disconnected":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return "text-red-600"
    if (value >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const getPerformanceBarColor = (value: number) => {
    if (value >= 80) return "bg-red-500"
    if (value >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitor: {database.name}</h1>
          <p className="text-gray-600">Real-time monitoring for {database.type} database</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusIcon(database.status)}
                  <Badge className={getStatusColor(database.status)}>{database.status}</Badge>
                </div>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold mt-2">{database.connections.active + database.connections.idle}</p>
                <p className="text-xs text-gray-500">
                  {database.connections.active} active, {database.connections.idle} idle
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold mt-2">{database.queries.avgResponseTime}ms</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(database.queries.avgResponseTime, 150)}
                  <p className="text-xs text-gray-500">vs last hour</p>
                </div>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold mt-2">{database.uptime}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>CPU Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(database.performance.cpu)}`}>
                      {database.performance.cpu}%
                    </span>
                  </div>
                  <Progress value={database.performance.cpu} className="h-3" />
                  <div className="text-xs text-gray-500">Average over last 5 minutes</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MemoryStick className="h-5 w-5" />
                  <span>Memory Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(database.performance.memory)}`}>
                      {database.performance.memory}%
                    </span>
                  </div>
                  <Progress value={database.performance.memory} className="h-3" />
                  <div className="text-xs text-gray-500">8GB total memory available</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Disk I/O</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(database.performance.disk)}`}>
                      {database.performance.disk}%
                    </span>
                  </div>
                  <Progress value={database.performance.disk} className="h-3" />
                  <div className="text-xs text-gray-500">Read/Write operations per second</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5" />
                  <span>Network I/O</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(database.performance.network)}`}>
                      {database.performance.network}%
                    </span>
                  </div>
                  <Progress value={database.performance.network} className="h-3" />
                  <div className="text-xs text-gray-500">Network bandwidth utilization</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{database.connections.active}</div>
                  <div className="text-sm text-gray-500 mt-2">Currently processing queries</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Idle Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{database.connections.idle}</div>
                  <div className="text-sm text-gray-500 mt-2">Available for new queries</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usage</span>
                    <span className="text-sm font-bold">
                      {database.connections.active + database.connections.idle} / {database.connections.max}
                    </span>
                  </div>
                  <Progress
                    value={((database.connections.active + database.connections.idle) / database.connections.max) * 100}
                    className="h-3"
                  />
                  <div className="text-xs text-gray-500">
                    {database.connections.max - database.connections.active - database.connections.idle} connections
                    available
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{database.queries.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-2">Last 24 hours</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Successful</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {database.queries.successful.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {((database.queries.successful / database.queries.total) * 100).toFixed(1)}% success rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{database.queries.failed}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {((database.queries.failed / database.queries.total) * 100).toFixed(2)}% failure rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{database.queries.avgResponseTime}ms</div>
                  <div className="text-sm text-gray-500 mt-2">Last hour average</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Storage Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Used Space</span>
                    <span className="text-lg font-bold">{database.storage.size}</span>
                  </div>
                  <Progress value={database.storage.used} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{database.storage.used}% used</span>
                    <span>{database.storage.available}% available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Backup Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-lg font-bold">{database.lastBackup}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Backup completed successfully</span>
                  </div>
                  <div className="text-xs text-gray-500">Next scheduled backup: In 22 hours</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Database Information */}
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
          <CardDescription>Technical details and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-600">Host</div>
              <div className="font-mono text-sm mt-1">
                {database.host}:{database.port}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Type</div>
              <div className="capitalize mt-1">{database.type}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Version</div>
              <div className="font-mono text-sm mt-1">{database.version}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Uptime</div>
              <div className="mt-1">{database.uptime}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
