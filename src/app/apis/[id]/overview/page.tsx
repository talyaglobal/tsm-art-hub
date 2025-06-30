"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Globe,
  Database,
  CreditCard,
  Package,
  Calculator,
  RefreshCw,
  Settings,
  Play,
  Pause,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ApiOverview {
  id: string
  name: string
  type: "ecommerce" | "accounting" | "payment" | "warehouse" | "banking"
  status: "active" | "inactive" | "error"
  uptime: number
  responseTime: number
  requestsToday: number
  errorRate: number
  lastSync: string
  dataTransferred: string
  version: string
  endpoint: string
}

interface MetricData {
  time: string
  requests: number
  responseTime: number
  errors: number
}

export default function ApiOverviewPage() {
  const params = useParams()
  const [api, setApi] = useState<ApiOverview | null>(null)
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadApiOverview = () => {
      const mockApi: ApiOverview = {
        id: params.id as string,
        name: "Shopify Store API",
        type: "ecommerce",
        status: "active",
        uptime: 99.8,
        responseTime: 120,
        requestsToday: 2847,
        errorRate: 0.2,
        lastSync: "2 minutes ago",
        dataTransferred: "45.2 MB",
        version: "2023-10",
        endpoint: "https://mystore.myshopify.com/admin/api/2023-10",
      }

      const mockMetrics: MetricData[] = [
        { time: "00:00", requests: 45, responseTime: 120, errors: 0 },
        { time: "04:00", requests: 23, responseTime: 110, errors: 1 },
        { time: "08:00", requests: 89, responseTime: 135, errors: 0 },
        { time: "12:00", requests: 156, responseTime: 145, errors: 2 },
        { time: "16:00", requests: 234, responseTime: 125, errors: 1 },
        { time: "20:00", requests: 178, responseTime: 115, errors: 0 },
      ]

      setApi(mockApi)
      setMetrics(mockMetrics)
      setIsLoading(false)
    }

    setTimeout(loadApiOverview, 800)
  }, [params.id])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ecommerce":
        return <Globe className="h-5 w-5" />
      case "accounting":
        return <Calculator className="h-5 w-5" />
      case "payment":
        return <CreditCard className="h-5 w-5" />
      case "warehouse":
        return <Package className="h-5 w-5" />
      case "banking":
        return <Database className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  if (isLoading || !api) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              {getTypeIcon(api.type)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{api.name}</h1>
                <p className="text-gray-600">API Overview & Health Status</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(api.status)}>
                {getStatusIcon(api.status)}
                <span className="ml-1">{api.status.charAt(0).toUpperCase() + api.status.slice(1)}</span>
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button size="sm">
                {api.status === "active" ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{api.uptime}%</div>
              <p className="text-xs text-gray-600">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{api.responseTime}ms</div>
              <p className="text-xs text-gray-600">Average today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{api.requestsToday.toLocaleString()}</div>
              <p className="text-xs text-gray-600">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{api.errorRate}%</div>
              <p className="text-xs text-gray-600">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>Requests over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle>API Information</CardTitle>
              <CardDescription>Basic configuration and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Endpoint</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">{api.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Version</p>
                  <p className="text-sm mt-1">{api.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Sync</p>
                  <p className="text-sm mt-1">{api.lastSync}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Transferred</p>
                  <p className="text-sm mt-1">{api.dataTransferred}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
