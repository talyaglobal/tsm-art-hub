"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Database,
  Activity,
  AlertTriangle,
  Settings,
  Shield,
  BarChart3,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Eye,
  Plus,
  Search,
  Filter,
  Server,
  Cpu,
  HardDrive,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalApis: number
  systemHealth: number
  monthlyRevenue: number
  supportTickets: number
  serverLoad: number
  databaseSize: number
  apiCalls24h: number
  errorRate: number
}

interface CriticalAlert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  resolved: boolean
  affectedUsers?: number
}

interface RecentActivity {
  id: string
  type: "user" | "api" | "system" | "security"
  action: string
  details: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalApis: 0,
    systemHealth: 0,
    monthlyRevenue: 0,
    supportTickets: 0,
    serverLoad: 0,
    databaseSize: 0,
    apiCalls24h: 0,
    errorRate: 0,
  })

  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading comprehensive admin data
    const loadAdminData = () => {
      setMetrics({
        totalUsers: 12847,
        activeUsers: 8932,
        totalApis: 2456,
        systemHealth: 98.7,
        monthlyRevenue: 284750,
        supportTickets: 23,
        serverLoad: 67.3,
        databaseSize: 2.4, // TB
        apiCalls24h: 1247832,
        errorRate: 0.12,
      })

      setCriticalAlerts([
        {
          id: "1",
          type: "critical",
          title: "Database Connection Pool Exhausted",
          message: "Primary database connection pool at 98% capacity",
          timestamp: "2 minutes ago",
          resolved: false,
          affectedUsers: 1200,
        },
        {
          id: "2",
          type: "warning",
          title: "High API Error Rate",
          message: "API error rate increased to 0.8% in the last hour",
          timestamp: "15 minutes ago",
          resolved: false,
          affectedUsers: 450,
        },
        {
          id: "3",
          type: "critical",
          title: "Payment Gateway Timeout",
          message: "Stripe payment processing experiencing delays",
          timestamp: "32 minutes ago",
          resolved: false,
          affectedUsers: 89,
        },
        {
          id: "4",
          type: "info",
          title: "Scheduled Maintenance Completed",
          message: "Database optimization completed successfully",
          timestamp: "2 hours ago",
          resolved: true,
        },
      ])

      setRecentActivity([
        {
          id: "1",
          type: "security",
          action: "Suspicious Login Blocked",
          details: "Multiple failed login attempts from IP 192.168.1.100",
          timestamp: "5 minutes ago",
          user: "Security System",
        },
        {
          id: "2",
          type: "user",
          action: "Premium User Upgraded",
          details: "User john@company.com upgraded to Enterprise plan",
          timestamp: "12 minutes ago",
          user: "Billing System",
        },
        {
          id: "3",
          type: "api",
          action: "New API Endpoint Created",
          details: "POST /api/v2/analytics/reports endpoint deployed",
          timestamp: "25 minutes ago",
          user: "dev@tsmarthub.com",
        },
        {
          id: "4",
          type: "system",
          action: "Server Auto-Scaled",
          details: "Added 2 new instances to handle increased load",
          timestamp: "1 hour ago",
          user: "Auto-Scaling System",
        },
        {
          id: "5",
          type: "user",
          action: "Bulk User Import",
          details: "Imported 150 users from CSV file",
          timestamp: "2 hours ago",
          user: "admin@tsmarthub.com",
        },
      ])

      setIsLoading(false)
    }

    setTimeout(loadAdminData, 1000)
  }, [])

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-950/20"
      case "warning":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "info":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-800"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4 text-blue-600" />
      case "api":
        return <Database className="h-4 w-4 text-green-600" />
      case "system":
        return <Server className="h-4 w-4 text-purple-600" />
      case "security":
        return <Shield className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Admin Control Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Control Center</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Real-time platform administration and monitoring
                  </p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                Administrator Access
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                System Config
              </Button>
              <Link href="/dashboard">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  User View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alerts Banner */}
        {criticalAlerts.filter((alert) => !alert.resolved && alert.type === "critical").length > 0 && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Critical System Alerts</h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {criticalAlerts.filter((alert) => !alert.resolved && alert.type === "critical").length} critical
                    issues require immediate attention
                  </p>
                </div>
              </div>
              <Link href="/admin/alerts">
                <Button variant="destructive" size="sm">
                  View All Alerts
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* System Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% online
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
              <Database className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalApis.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.3% growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.systemHealth}%</div>
              <Progress value={metrics.systemHealth} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.8% vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.supportTickets}</div>
              <p className="text-xs text-red-600 mt-1">5 urgent tickets</p>
            </CardContent>
          </Card>
        </div>

        {/* Infrastructure Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Load</CardTitle>
              <Cpu className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.serverLoad}%</div>
              <Progress value={metrics.serverLoad} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              <HardDrive className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.databaseSize} TB</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">+2.3% this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls (24h)</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.apiCalls24h.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.7% vs yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.errorRate}%</div>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.05% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  System Alerts & Incidents
                </CardTitle>
                <CardDescription>Monitor and manage critical system alerts and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${getAlertColor(alert.type)} ${alert.resolved ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{alert.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{alert.timestamp}</span>
                              {alert.affectedUsers && <span>{alert.affectedUsers} users affected</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.resolved ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Resolved
                            </Badge>
                          ) : (
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                Investigate
                              </Button>
                              <Button size="sm">Resolve</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>Track recent system events and administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">{activity.action}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.details}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{activity.timestamp}</span>
                          {activity.user && <span>by {activity.user}</span>}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search Users
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>User management interface will be loaded here</p>
                  <Link href="/admin/users">
                    <Button className="mt-4">Go to User Management</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
