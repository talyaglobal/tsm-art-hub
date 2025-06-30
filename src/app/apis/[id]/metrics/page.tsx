"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, RefreshCw } from "lucide-react"

interface MetricsData {
  hourly: Array<{
    time: string
    requests: number
    responseTime: number
    errors: number
    successRate: number
  }>
  daily: Array<{
    date: string
    requests: number
    responseTime: number
    errors: number
    dataTransferred: number
  }>
  statusCodes: Array<{
    code: string
    count: number
    percentage: number
  }>
  endpoints: Array<{
    endpoint: string
    requests: number
    avgResponseTime: number
    errorRate: number
  }>
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function ApiMetricsPage() {
  const params = useParams()
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    const loadMetrics = () => {
      const mockMetrics: MetricsData = {
        hourly: [
          { time: "00:00", requests: 45, responseTime: 120, errors: 0, successRate: 100 },
          { time: "01:00", requests: 32, responseTime: 115, errors: 1, successRate: 96.9 },
          { time: "02:00", requests: 28, responseTime: 110, errors: 0, successRate: 100 },
          { time: "03:00", requests: 23, responseTime: 108, errors: 1, successRate: 95.7 },
          { time: "04:00", requests: 19, responseTime: 112, errors: 0, successRate: 100 },
          { time: "05:00", requests: 25, responseTime: 118, errors: 0, successRate: 100 },
          { time: "06:00", requests: 41, responseTime: 125, errors: 2, successRate: 95.1 },
          { time: "07:00", requests: 67, responseTime: 132, errors: 1, successRate: 98.5 },
          { time: "08:00", requests: 89, responseTime: 135, errors: 0, successRate: 100 },
          { time: "09:00", requests: 124, responseTime: 142, errors: 3, successRate: 97.6 },
          { time: "10:00", requests: 156, responseTime: 145, errors: 2, successRate: 98.7 },
          { time: "11:00", requests: 189, responseTime: 148, errors: 4, successRate: 97.9 },
          { time: "12:00", requests: 234, responseTime: 152, errors: 5, successRate: 97.9 },
          { time: "13:00", requests: 267, responseTime: 155, errors: 3, successRate: 98.9 },
          { time: "14:00", requests: 298, responseTime: 158, errors: 6, successRate: 98.0 },
          { time: "15:00", requests: 312, responseTime: 162, errors: 4, successRate: 98.7 },
          { time: "16:00", requests: 289, responseTime: 159, errors: 2, successRate: 99.3 },
          { time: "17:00", requests: 256, responseTime: 156, errors: 3, successRate: 98.8 },
          { time: "18:00", requests: 223, responseTime: 153, errors: 1, successRate: 99.6 },
          { time: "19:00", requests: 198, responseTime: 150, errors: 2, successRate: 99.0 },
          { time: "20:00", requests: 178, responseTime: 147, errors: 1, successRate: 99.4 },
          { time: "21:00", requests: 156, responseTime: 144, errors: 0, successRate: 100 },
          { time: "22:00", requests: 134, responseTime: 141, errors: 1, successRate: 99.3 },
          { time: "23:00", requests: 112, responseTime: 138, errors: 0, successRate: 100 },
        ],
        daily: [
          { date: "Mon", requests: 2847, responseTime: 145, errors: 23, dataTransferred: 45.2 },
          { date: "Tue", requests: 3156, responseTime: 142, errors: 18, dataTransferred: 52.1 },
          { date: "Wed", requests: 2934, responseTime: 148, errors: 31, dataTransferred: 48.7 },
          { date: "Thu", requests: 3298, responseTime: 139, errors: 15, dataTransferred: 56.3 },
          { date: "Fri", requests: 3567, responseTime: 141, errors: 22, dataTransferred: 61.2 },
          { date: "Sat", requests: 2123, responseTime: 136, errors: 12, dataTransferred: 34.8 },
          { date: "Sun", requests: 1876, responseTime: 133, errors: 8, dataTransferred: 29.4 },
        ],
        statusCodes: [
          { code: "200", count: 2654, percentage: 93.2 },
          { code: "201", count: 123, percentage: 4.3 },
          { code: "400", count: 45, percentage: 1.6 },
          { code: "404", count: 18, percentage: 0.6 },
          { code: "500", count: 7, percentage: 0.3 },
        ],
        endpoints: [
          { endpoint: "/products", requests: 1234, avgResponseTime: 125, errorRate: 0.8 },
          { endpoint: "/orders", requests: 987, avgResponseTime: 156, errorRate: 1.2 },
          { endpoint: "/customers", requests: 456, avgResponseTime: 134, errorRate: 0.4 },
          { endpoint: "/inventory", requests: 234, avgResponseTime: 189, errorRate: 2.1 },
          { endpoint: "/webhooks", requests: 123, avgResponseTime: 98, errorRate: 0.0 },
        ],
      }

      setMetrics(mockMetrics)
      setIsLoading(false)
    }

    setTimeout(loadMetrics, 800)
  }, [params.id, timeRange])

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Metrics</h1>
              <p className="text-gray-600">Performance analytics and insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant={timeRange === "24h" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("24h")}
                >
                  24h
                </Button>
                <Button
                  variant={timeRange === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("7d")}
                >
                  7d
                </Button>
                <Button
                  variant={timeRange === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("30d")}
                >
                  30d
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trend</CardTitle>
                  <CardDescription>Average response time over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeRange === "24h" ? metrics.hourly : metrics.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={timeRange === "24h" ? "time" : "date"} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rate</CardTitle>
                  <CardDescription>Percentage of successful requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.hourly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[90, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="successRate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Volume</CardTitle>
                  <CardDescription>Number of requests over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeRange === "24h" ? metrics.hourly : metrics.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={timeRange === "24h" ? "time" : "date"} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Code Distribution</CardTitle>
                  <CardDescription>Breakdown of HTTP status codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.statusCodes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ code, percentage }) => `${code} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {metrics.statusCodes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Trend</CardTitle>
                  <CardDescription>Error count over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeRange === "24h" ? metrics.hourly : metrics.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={timeRange === "24h" ? "time" : "date"} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Status Codes</CardTitle>
                  <CardDescription>Distribution of error responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.statusCodes
                      .filter((status) => Number.parseInt(status.code) >= 400)
                      .map((status) => (
                        <div key={status.code} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="destructive">{status.code}</Badge>
                            <span className="text-sm font-medium">
                              {status.code === "400"
                                ? "Bad Request"
                                : status.code === "404"
                                  ? "Not Found"
                                  : status.code === "500"
                                    ? "Server Error"
                                    : "Error"}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{status.count}</p>
                            <p className="text-xs text-gray-500">{status.percentage}%</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Performance</CardTitle>
                <CardDescription>Performance metrics by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.endpoints.map((endpoint) => (
                    <div key={endpoint.endpoint} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium font-mono text-sm">{endpoint.endpoint}</h4>
                        <Badge variant={endpoint.errorRate > 1 ? "destructive" : "default"}>
                          {endpoint.errorRate}% errors
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Requests</p>
                          <p className="font-medium">{endpoint.requests.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Response Time</p>
                          <p className="font-medium">{endpoint.avgResponseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Error Rate</p>
                          <p className={`font-medium ${endpoint.errorRate > 1 ? "text-red-600" : "text-green-600"}`}>
                            {endpoint.errorRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
