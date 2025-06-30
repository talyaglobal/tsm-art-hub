"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"
import { BarChart3, TrendingUp, TrendingDown, Activity, Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface AnalyticsData {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  activeIntegrations: number
  requestsToday: number
  requestsGrowth: number
  errorRate: number
  topIntegrations: Array<{
    name: string
    requests: number
    successRate: number
  }>
  recentErrors: Array<{
    id: string
    integration: string
    error: string
    timestamp: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalyticsData = async () => {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setData({
        totalRequests: 125430,
        successRate: 97.7,
        averageResponseTime: 245,
        activeIntegrations: 18,
        requestsToday: 8420,
        requestsGrowth: 12.5,
        errorRate: 2.3,
        topIntegrations: [
          { name: "Shopify to Salesforce", requests: 45230, successRate: 98.5 },
          { name: "Stripe to QuickBooks", requests: 32100, successRate: 99.2 },
          { name: "WooCommerce to NetSuite", requests: 28900, successRate: 95.8 },
          { name: "HubSpot to Pipedrive", requests: 19200, successRate: 97.1 },
        ],
        recentErrors: [
          {
            id: "err_1",
            integration: "WooCommerce to NetSuite",
            error: "API rate limit exceeded",
            timestamp: "2 hours ago",
          },
          {
            id: "err_2",
            integration: "Shopify to Salesforce",
            error: "Authentication failed",
            timestamp: "4 hours ago",
          },
          {
            id: "err_3",
            integration: "Stripe to QuickBooks",
            error: "Invalid data format",
            timestamp: "6 hours ago",
          },
        ],
      })

      setIsLoading(false)
    }

    loadAnalyticsData()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <BackButton href="/dashboard" />
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton href="/dashboard" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Monitor API performance and integration metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant={timeRange === "24h" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("24h")}>
              24h
            </Button>
            <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
              7d
            </Button>
            <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
              30d
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalRequests.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{data.requestsGrowth}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.successRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +0.3% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.averageResponseTime}ms</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                -15ms from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeIntegrations}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +2 new this week
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Integrations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Integrations
              </CardTitle>
              <CardDescription>Most active integrations by request volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topIntegrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{integration.name}</p>
                        <p className="text-sm text-gray-600">{integration.requests.toLocaleString()} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={integration.successRate > 98 ? "default" : "secondary"}>
                        {integration.successRate}% success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Errors
              </CardTitle>
              <CardDescription>Latest integration errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentErrors.map((error) => (
                  <div key={error.id} className="border-l-2 border-red-200 pl-3">
                    <p className="font-medium text-gray-900 text-sm">{error.integration}</p>
                    <p className="text-sm text-red-600">{error.error}</p>
                    <p className="text-xs text-gray-500">{error.timestamp}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All Errors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Volume Chart Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Request Volume Over Time
            </CardTitle>
            <CardDescription>API request patterns for the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Coming Soon</h3>
                <p className="text-gray-600">Interactive charts and visualizations will be available here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key recommendations to optimize your integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Optimization Opportunity</span>
                </div>
                <p className="text-sm text-gray-600">
                  Consider implementing caching for the Shopify integration to reduce response times by up to 40%
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Rate Limit Warning</span>
                </div>
                <p className="text-sm text-gray-600">
                  WooCommerce integration is approaching rate limits. Consider reducing sync frequency
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Performance Excellent</span>
                </div>
                <p className="text-sm text-gray-600">
                  Stripe integration is performing optimally with 99.2% success rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
