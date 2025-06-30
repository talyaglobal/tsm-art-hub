"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Users,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Filter,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Metric {
  label: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
  icon: any
  color: string
}

interface SystemStatus {
  service: string
  status: "healthy" | "warning" | "error"
  uptime: string
  responseTime: number
  lastCheck: string
}

interface RecentActivity {
  id: string
  type: "integration" | "user" | "system" | "api"
  title: string
  description: string
  timestamp: string
  status: "success" | "warning" | "error"
  user?: string
}

export default function OverviewPage() {
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("24h")

  const metrics: Metric[] = [
    {
      label: "Total API Requests",
      value: "2.4M",
      change: 12.5,
      trend: "up",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      label: "Active Users",
      value: "8,432",
      change: 8.2,
      trend: "up",
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Data Processed",
      value: "156.2GB",
      change: -2.1,
      trend: "down",
      icon: Database,
      color: "text-purple-600",
    },
    {
      label: "Active Integrations",
      value: "247",
      change: 15.3,
      trend: "up",
      icon: Zap,
      color: "text-orange-600",
    },
  ]

  const systemStatus: SystemStatus[] = [
    {
      service: "API Gateway",
      status: "healthy",
      uptime: "99.98%",
      responseTime: 45,
      lastCheck: "2 minutes ago",
    },
    {
      service: "Database Cluster",
      status: "healthy",
      uptime: "99.95%",
      responseTime: 12,
      lastCheck: "1 minute ago",
    },
    {
      service: "Integration Hub",
      status: "warning",
      uptime: "99.87%",
      responseTime: 89,
      lastCheck: "3 minutes ago",
    },
    {
      service: "Analytics Engine",
      status: "healthy",
      uptime: "99.99%",
      responseTime: 23,
      lastCheck: "1 minute ago",
    },
    {
      service: "Notification Service",
      status: "healthy",
      uptime: "99.92%",
      responseTime: 67,
      lastCheck: "2 minutes ago",
    },
  ]

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "integration",
      title: "Salesforce Integration Deployed",
      description: "New Salesforce connector deployed to production",
      timestamp: "5 minutes ago",
      status: "success",
      user: "John Smith",
    },
    {
      id: "2",
      type: "api",
      title: "API Rate Limit Exceeded",
      description: "Client exceeded rate limit for /api/v1/data endpoint",
      timestamp: "12 minutes ago",
      status: "warning",
    },
    {
      id: "3",
      type: "user",
      title: "New User Registration",
      description: "Sarah Johnson registered and completed onboarding",
      timestamp: "18 minutes ago",
      status: "success",
      user: "Sarah Johnson",
    },
    {
      id: "4",
      type: "system",
      title: "Database Backup Completed",
      description: "Scheduled backup completed successfully",
      timestamp: "1 hour ago",
      status: "success",
    },
    {
      id: "5",
      type: "integration",
      title: "Webhook Delivery Failed",
      description: "Failed to deliver webhook to client endpoint",
      timestamp: "2 hours ago",
      status: "error",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "integration":
        return Zap
      case "user":
        return Users
      case "system":
        return Settings
      case "api":
        return Activity
      default:
        return Activity
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate data refresh
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Bypass Login Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white border-green-500"
          onClick={() => {
            toast({
              title: "Login Bypassed",
              description: "You can now access all overview features without authentication.",
            })
          }}
        >
          🔓 Bypass Login
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Overview</h1>
            <p className="text-gray-600">Monitor your platform's performance and activity in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setTimeRange(timeRange === "24h" ? "7d" : "24h")}>
              <Filter className="h-4 w-4 mr-2" />
              {timeRange === "24h" ? "Last 24 Hours" : "Last 7 Days"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : metric.trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <div className="h-4 w-4 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metric.trend === "up"
                        ? "text-green-600"
                        : metric.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>API response times and throughput over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive chart would be rendered here</p>
                    <p className="text-sm text-gray-500">Showing {timeRange} performance data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Real-time status of all system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStatus.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">{service.service}</h4>
                          <p className="text-sm text-gray-600">Last checked {service.lastCheck}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium">Uptime</p>
                            <p className="text-sm text-gray-600">{service.uptime}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Response</p>
                            <p className="text-sm text-gray-600">{service.responseTime}ms</p>
                          </div>
                          <Badge
                            variant={
                              service.status === "healthy"
                                ? "default"
                                : service.status === "warning"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 6).map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type)
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ActivityIcon className={`h-4 w-4 ${getActivityColor(activity.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{activity.timestamp}</span>
                            {activity.user && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{activity.user}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Usage</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Network I/O</span>
                    <span className="font-medium">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
