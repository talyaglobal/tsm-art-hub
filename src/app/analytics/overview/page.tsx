"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Globe,
  PieChart,
} from "lucide-react"
import Link from "next/link"

interface AnalyticsMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTime: number
  dataTransferred: number
  activeUsers: number
  peakConcurrency: number
  errorRate: number
  uptime: number
  throughput: number
}

interface TopEndpoint {
  name: string
  requests: number
  avgResponseTime: number
  errorRate: number
  growth: number
  status: "healthy" | "warning" | "critical"
  successRate: number
}

interface ErrorAnalysis {
  type: string
  count: number
  percentage: number
  trend: "up" | "down" | "stable"
  lastOccurrence: string
  severity: "low" | "medium" | "high"
}

export default function AnalyticsOverviewPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRequests: 2456789,
    successfulRequests: 2418234,
    failedRequests: 38555,
    avgResponseTime: 245,
    dataTransferred: 15.7,
    activeUsers: 1247,
    peakConcurrency: 892,
    errorRate: 1.57,
    uptime: 99.8,
    throughput: 102.4,
  })

  const [topEndpoints, setTopEndpoints] = useState<TopEndpoint[]>([
    {
      name: "Shopify Products API",
      requests: 847234,
      avgResponseTime: 180,
      errorRate: 0.8,
      growth: 15.2,
      status: "healthy",
      successRate: 99.2,
    },
    {
      name: "Stripe Payments API",
      requests: 623891,
      avgResponseTime: 220,
      errorRate: 1.2,
      growth: 8.7,
      status: "healthy",
      successRate: 98.8,
    },
    {
      name: "QuickBooks Invoices",
      requests: 412567,
      avgResponseTime: 340,
      errorRate: 3.4,
      growth: 22.1,
      status: "warning",
      successRate: 96.6,
    },
    {
      name: "WMS Inventory API",
      requests: 298123,
      avgResponseTime: 195,
      errorRate: 0.5,
      growth: 5.3,
      status: "healthy",
      successRate: 99.5,
    },
    {
      name: "Salesforce Contacts",
      requests: 187456,
      avgResponseTime: 450,
      errorRate: 5.8,
      growth: -2.1,
      status: "critical",
      successRate: 94.2,
    },
  ])

  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis[]>([
    {
      type: "Authentication Failed",
      count: 15234,
      percentage: 39.5,
      trend: "down",
      lastOccurrence: "2 minutes ago",
      severity: "high",
    },
    {
      type: "Rate Limit Exceeded",
      count: 8967,
      percentage: 23.3,
      trend: "up",
      lastOccurrence: "5 minutes ago",
      severity: "medium",
    },
    {
      type: "Timeout",
      count: 6789,
      percentage: 17.6,
      trend: "stable",
      lastOccurrence: "1 minute ago",
      severity: "medium",
    },
    {
      type: "Invalid Request",
      count: 4523,
      percentage: 11.7,
      trend: "down",
      lastOccurrence: "3 minutes ago",
      severity: "low",
    },
    {
      type: "Server Error",
      count: 3042,
      percentage: 7.9,
      trend: "up",
      lastOccurrence: "8 minutes ago",
      severity: "high",
    },
  ])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
            <p className="text-gray-600">Comprehensive insights into your API performance and usage</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalRequests)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+18.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={Number.parseFloat(successRate)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}ms</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-8ms from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.activeUsers)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="endpoints">Top Endpoints</TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
            <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Volume Trends</CardTitle>
                  <CardDescription>API request volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive chart visualization</p>
                      <p className="text-sm text-gray-500">Request volume trends would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Distribution</CardTitle>
                  <CardDescription>API response time patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Response time distribution</p>
                      <p className="text-sm text-gray-500">Performance metrics would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.dataTransferred}GB</div>
                    <p className="text-sm text-gray-600">Total data transferred</p>
                    <div className="mt-4">
                      <Progress value={(metrics.dataTransferred / 20) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Peak Concurrency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{metrics.peakConcurrency}</div>
                    <p className="text-sm text-gray-600">Concurrent requests</p>
                    <div className="mt-4">
                      <Progress value={(metrics.peakConcurrency / 1000) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{metrics.throughput}</div>
                    <p className="text-sm text-gray-600">Requests per second</p>
                    <div className="mt-4">
                      <Progress value={(metrics.throughput / 200) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top API Endpoints</CardTitle>
                <CardDescription>Most frequently used endpoints and their performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEndpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <h4 className="font-medium">{endpoint.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatNumber(endpoint.requests)} requests • {endpoint.avgResponseTime}ms avg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">Growth</div>
                          <div
                            className={`text-lg font-bold ${endpoint.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {endpoint.growth >= 0 ? "+" : ""}
                            {endpoint.growth}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Success Rate</div>
                          <div className="text-lg font-bold">{endpoint.successRate}%</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(endpoint.status)}
                          <Badge className={getStatusColor(endpoint.status)}>{endpoint.status}</Badge>
                        </div>
                        <Link href={`/apis/${endpoint.name.toLowerCase().replace(/\s+/g, "-")}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Error Breakdown</CardTitle>
                  <CardDescription>Most common error types and their frequency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {errorAnalysis.map((error, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTrendIcon(error.trend)}
                          <div>
                            <h4 className="font-medium">{error.type}</h4>
                            <p className="text-sm text-gray-500">Last: {error.lastOccurrence}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-lg font-bold">{formatNumber(error.count)}</div>
                            <div className="text-sm text-gray-500">{error.percentage}%</div>
                          </div>
                          <Badge className={getSeverityColor(error.severity)}>{error.severity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Trends</CardTitle>
                  <CardDescription>Error patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Error trend analysis</p>
                      <p className="text-sm text-gray-500">Error patterns and trends would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Error Summary</CardTitle>
                <CardDescription>Quick overview of error statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{formatNumber(metrics.failedRequests)}</div>
                    <div className="text-sm text-gray-600">Total Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{metrics.errorRate}%</div>
                    <div className="text-sm text-gray-600">Error Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">5</div>
                    <div className="text-sm text-gray-600">Error Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2m</div>
                    <div className="text-sm text-gray-600">Last Error</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage by Time</CardTitle>
                  <CardDescription>Request patterns throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Hourly usage patterns</p>
                      <p className="text-sm text-gray-500">Time-based usage analytics would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Requests by geographic location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Geographic distribution</p>
                      <p className="text-sm text-gray-500">World map with usage data would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Detailed usage metrics and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{formatNumber(metrics.totalRequests)}</div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                    <div className="text-xs text-gray-500 mt-1">Last {timeRange}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">{formatNumber(metrics.activeUsers)}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                    <div className="text-xs text-gray-500 mt-1">Currently online</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">{metrics.peakConcurrency}</div>
                    <div className="text-sm text-gray-600">Peak Concurrency</div>
                    <div className="text-xs text-gray-500 mt-1">Maximum simultaneous</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">{metrics.dataTransferred}GB</div>
                    <div className="text-sm text-gray-600">Data Transferred</div>
                    <div className="text-xs text-gray-500 mt-1">Total bandwidth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common analytics tasks and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/analytics/reports/create">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Create Report</span>
                </Button>
              </Link>
              <Link href="/analytics/realtime">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Zap className="h-6 w-6" />
                  <span className="text-sm">Real-time Monitor</span>
                </Button>
              </Link>
              <Link href="/analytics/charts">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <PieChart className="h-6 w-6" />
                  <span className="text-sm">Custom Charts</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Download className="h-6 w-6" />
                <span className="text-sm">Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
