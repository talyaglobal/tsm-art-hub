"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Key,
  LineChart,
  Monitor,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Webhook,
  Zap,
  Brain,
  Target,
  Layers,
  GitBranch,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface API {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "error"
  endpoint: string
  method: string
  lastUsed: string
  requestCount: number
  errorRate: number
  responseTime: number
  version: string
}

interface Integration {
  id: string
  name: string
  source: string
  destination: string
  status: "running" | "paused" | "error" | "draft"
  lastSync: string
  recordsProcessed: number
  errorCount: number
  schedule: string
  healthScore: number
}

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "developer" | "viewer"
  status: "active" | "inactive"
  lastLogin: string
  apiUsage: number
  permissions: string[]
}

interface UsageMetrics {
  totalRequests: number
  successfulRequests: number
  errorRequests: number
  avgResponseTime: number
  dataTransferred: number
  activeIntegrations: number
  totalUsers: number
  billingAmount: number
}

export default function AdminPortal() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)

  // Mock data - in production, this would come from APIs
  const [apis, setApis] = useState<API[]>([
    {
      id: "1",
      name: "Customer Sync API",
      description: "Synchronizes customer data between platforms",
      status: "active",
      endpoint: "/api/customers/sync",
      method: "POST",
      lastUsed: "2024-01-15T10:30:00Z",
      requestCount: 1250,
      errorRate: 0.02,
      responseTime: 245,
      version: "1.2.0",
    },
    {
      id: "2",
      name: "Order Processing API",
      description: "Processes and validates order data",
      status: "active",
      endpoint: "/api/orders/process",
      method: "POST",
      lastUsed: "2024-01-15T11:15:00Z",
      requestCount: 890,
      errorRate: 0.01,
      responseTime: 180,
      version: "2.1.0",
    },
  ])

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Shopify → QuickBooks",
      source: "Shopify",
      destination: "QuickBooks",
      status: "running",
      lastSync: "2024-01-15T11:00:00Z",
      recordsProcessed: 1500,
      errorCount: 2,
      schedule: "Every 15 minutes",
      healthScore: 0.95,
    },
    {
      id: "2",
      name: "Stripe → Mailchimp",
      source: "Stripe",
      destination: "Mailchimp",
      status: "running",
      lastSync: "2024-01-15T10:45:00Z",
      recordsProcessed: 750,
      errorCount: 0,
      schedule: "Daily at 9 AM",
      healthScore: 1.0,
    },
  ])

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@company.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15T09:30:00Z",
      apiUsage: 2500,
      permissions: ["read", "write", "admin"],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@company.com",
      role: "developer",
      status: "active",
      lastLogin: "2024-01-15T08:15:00Z",
      apiUsage: 1200,
      permissions: ["read", "write"],
    },
  ])

  const [metrics, setMetrics] = useState<UsageMetrics>({
    totalRequests: 15420,
    successfulRequests: 15180,
    errorRequests: 240,
    avgResponseTime: 215,
    dataTransferred: 2.4, // GB
    activeIntegrations: 8,
    totalUsers: 12,
    billingAmount: 299.99,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAPI, setSelectedAPI] = useState<API | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showCreateAPI, setShowCreateAPI] = useState(false)
  const [showCreateIntegration, setShowCreateIntegration] = useState(false)

  const handleCreateAPI = async (apiData: Partial<API>) => {
    setLoading(true)
    try {
      // Simulate API creation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newAPI: API = {
        id: Date.now().toString(),
        name: apiData.name || "New API",
        description: apiData.description || "",
        status: "active",
        endpoint: apiData.endpoint || "/api/new",
        method: apiData.method || "GET",
        lastUsed: new Date().toISOString(),
        requestCount: 0,
        errorRate: 0,
        responseTime: 0,
        version: "1.0.0",
      }

      setApis((prev) => [...prev, newAPI])
      setShowCreateAPI(false)
      toast({
        title: "API Created",
        description: "Your new API has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAPI = async (apiId: string) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setApis((prev) =>
        prev.map((api) =>
          api.id === apiId ? { ...api, status: api.status === "active" ? "inactive" : "active" } : api,
        ),
      )

      toast({
        title: "API Updated",
        description: "API status has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API status.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAPI = async (apiId: string) => {
    if (!confirm("Are you sure you want to delete this API?")) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setApis((prev) => prev.filter((api) => api.id !== apiId))
      toast({
        title: "API Deleted",
        description: "API has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "running":
        return "bg-green-500"
      case "inactive":
      case "paused":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      case "draft":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const filteredAPIs = apis.filter(
    (api) =>
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer & Admin Portal</h1>
          <p className="text-gray-600">Comprehensive management for APIs, integrations, users, and analytics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
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
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(metrics.successfulRequests / metrics.totalRequests) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeIntegrations}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <GitBranch className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-600">2 new this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.billingAmount}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="documentation">Docs</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New integration created</p>
                        <p className="text-xs text-gray-500">Shopify → QuickBooks - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">API endpoint updated</p>
                        <p className="text-xs text-gray-500">Customer Sync API v1.2.0 - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User permissions updated</p>
                        <p className="text-xs text-gray-500">jane@company.com - 6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Response Time</span>
                      <span className="text-sm text-green-600">{metrics.avgResponseTime}ms</span>
                    </div>
                    <Progress value={85} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Integration Health</span>
                      <span className="text-sm text-green-600">98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm text-green-600">1.5%</span>
                    </div>
                    <Progress value={1.5} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>Intelligent recommendations based on your data patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Optimization</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your Shopify integration could benefit from batch processing to reduce API calls by 40%
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      Apply Suggestion
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-sm">Anomaly Detected</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Unusual spike in error rates for Order Processing API detected at 3:15 PM
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      Investigate
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Growth Opportunity</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on usage patterns, consider upgrading to Pro plan for better performance
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">API Management</h2>
                <p className="text-gray-600">Create, configure, and monitor your APIs</p>
              </div>
              <Button onClick={() => setShowCreateAPI(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search APIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* APIs Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Error Rate</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAPIs.map((api) => (
                      <TableRow key={api.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{api.name}</p>
                            <p className="text-sm text-gray-500">{api.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={api.status === "active" ? "default" : "secondary"}
                            className={`${getStatusColor(api.status)} text-white`}
                          >
                            {api.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {api.method} {api.endpoint}
                          </code>
                        </TableCell>
                        <TableCell>{formatNumber(api.requestCount)}</TableCell>
                        <TableCell>
                          <span className={api.errorRate > 0.05 ? "text-red-600" : "text-green-600"}>
                            {(api.errorRate * 100).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell>{api.responseTime}ms</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedAPI(api)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleToggleAPI(api.id)}>
                              {api.status === "active" ? "Pause" : "Start"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteAPI(api.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* API Testing Interface */}
            <Card>
              <CardHeader>
                <CardTitle>API Testing</CardTitle>
                <CardDescription>Test your APIs directly from the portal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="test-method">Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="GET" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="test-endpoint">Endpoint</Label>
                    <Input placeholder="/api/customers/sync" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="test-body">Request Body (JSON)</Label>
                  <Textarea placeholder='{"customer_id": "123", "sync_type": "full"}' className="font-mono" rows={4} />
                </div>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Integration Management</h2>
                <p className="text-gray-600">Monitor and manage your data integrations</p>
              </div>
              <Button onClick={() => setShowCreateIntegration(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Integration
              </Button>
            </div>

            {/* Integration Canvas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Visual Integration Builder
                </CardTitle>
                <CardDescription>Drag and drop to create complex data flows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Visual Flow Builder</p>
                    <Button variant="outline">Open Canvas</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge
                        variant={integration.status === "running" ? "default" : "secondary"}
                        className={`${getStatusColor(integration.status)} text-white`}
                      >
                        {integration.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {integration.source} → {integration.destination}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Last Sync</p>
                        <p className="font-medium">{formatDate(integration.lastSync)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Records Processed</p>
                        <p className="font-medium">{formatNumber(integration.recordsProcessed)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Schedule</p>
                        <p className="font-medium">{integration.schedule}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Health Score</p>
                        <p className="font-medium text-green-600">{(integration.healthScore * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Health Score</span>
                        <span>{(integration.healthScore * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={integration.healthScore * 100} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Logs
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics & Reports</h2>
              <p className="text-gray-600">Comprehensive insights into your data flows</p>
            </div>

            {/* Custom Dashboard Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Dashboard</CardTitle>
                <CardDescription>Build custom reports and visualizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Bar Chart</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                    <LineChart className="h-6 w-6 mb-2" />
                    <span className="text-sm">Line Chart</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                    <Activity className="h-6 w-6 mb-2" />
                    <span className="text-sm">Real-time</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive chart would be here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance metrics chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export & Reporting</CardTitle>
                <CardDescription>Generate and schedule reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF Report
                  </Button>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User & Access Management</h2>
                <p className="text-gray-600">Manage users, roles, and permissions</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>API Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === "active" ? "default" : "secondary"}
                            className={`${getStatusColor(user.status)} text-white`}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>{formatNumber(user.apiUsage)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Role Management */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Permission Management</CardTitle>
                <CardDescription>Configure roles and their associated permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Admin</h3>
                    <p className="text-sm text-gray-600 mb-3">Full system access</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Manage APIs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Manage Integrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>View Analytics</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Developer</h3>
                    <p className="text-sm text-gray-600 mb-3">API and integration access</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Manage APIs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Manage Integrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-300" />
                        <span>Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>View Analytics</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Viewer</h3>
                    <p className="text-sm text-gray-600 mb-3">Read-only access</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-300" />
                        <span>Manage APIs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-300" />
                        <span>Manage Integrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-300" />
                        <span>Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>View Analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Auto-Generated Documentation</h2>
              <p className="text-gray-600">Comprehensive API and integration documentation</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Documentation Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Getting Started
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      API Reference
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Integration Guides
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      Authentication
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Webhook className="h-4 w-4 mr-2" />
                      Webhooks
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Documentation Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>API Reference - Customer Sync</CardTitle>
                    <CardDescription>Automatically generated from your API schema</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Endpoint</h3>
                      <code className="block bg-gray-100 p-3 rounded text-sm">POST /api/customers/sync</code>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Request Body</h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {`{
  "customer_id": "string",
  "sync_type": "full" | "incremental",
  "fields": ["name", "email", "phone"],
  "webhook_url": "string (optional)"
}`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Response</h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {`{
  "success": true,
  "sync_id": "sync_123456",
  "records_processed": 150,
  "estimated_completion": "2024-01-15T12:00:00Z"
}`}
                      </pre>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export OpenAPI
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate SDK
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Billing & Usage</h2>
              <p className="text-gray-600">Transparent usage tracking and billing information</p>
            </div>

            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan - Professional</CardTitle>
                <CardDescription>Your current subscription and usage details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">${metrics.billingAmount}</p>
                    <p className="text-sm text-gray-500">Monthly Cost</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatNumber(metrics.totalRequests)}</p>
                    <p className="text-sm text-gray-500">API Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{metrics.dataTransferred}GB</p>
                    <p className="text-sm text-gray-500">Data Transferred</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{metrics.activeIntegrations}</p>
                    <p className="text-sm text-gray-500">Active Integrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage by API</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apis.map((api) => (
                      <div key={api.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{api.name}</p>
                          <p className="text-sm text-gray-500">{formatNumber(api.requestCount)} requests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(api.requestCount * 0.001).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">$0.001/request</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">January 2024</p>
                        <p className="text-sm text-gray-500">Professional Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$299.99</p>
                        <Badge variant="outline" className="text-green-600">
                          Paid
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">December 2023</p>
                        <p className="text-sm text-gray-500">Professional Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$299.99</p>
                        <Badge variant="outline" className="text-green-600">
                          Paid
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Upgrade */}
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>Get more features and higher limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Starter</h3>
                    <p className="text-2xl font-bold mb-2">
                      $99<span className="text-sm font-normal">/month</span>
                    </p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• 10,000 API requests</li>
                      <li>• 5 integrations</li>
                      <li>• Basic support</li>
                    </ul>
                    <Button variant="outline" className="w-full bg-transparent">
                      Current Plan
                    </Button>
                  </div>

                  <div className="p-4 border-2 border-blue-500 rounded-lg relative">
                    <Badge className="absolute -top-2 left-4 bg-blue-500">Popular</Badge>
                    <h3 className="font-medium mb-2">Professional</h3>
                    <p className="text-2xl font-bold mb-2">
                      $299<span className="text-sm font-normal">/month</span>
                    </p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• 100,000 API requests</li>
                      <li>• Unlimited integrations</li>
                      <li>• Priority support</li>
                      <li>• Advanced analytics</li>
                    </ul>
                    <Button className="w-full">Upgrade</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Enterprise</h3>
                    <p className="text-2xl font-bold mb-2">Custom</p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• Unlimited everything</li>
                      <li>• Custom integrations</li>
                      <li>• Dedicated support</li>
                      <li>• SLA guarantee</li>
                    </ul>
                    <Button variant="outline" className="w-full bg-transparent">
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">System Settings</h2>
              <p className="text-gray-600">Configure your platform settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input id="org-name" defaultValue="Acme Corporation" />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="UTC-8 (Pacific)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-8">UTC-8 (Pacific)</SelectItem>
                        <SelectItem value="utc-5">UTC-5 (Eastern)</SelectItem>
                        <SelectItem value="utc">UTC (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API Key Rotation</Label>
                      <p className="text-sm text-gray-500">Automatically rotate API keys monthly</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <Label>IP Whitelist</Label>
                    <Textarea placeholder="192.168.1.1&#10;10.0.0.0/8" className="font-mono" />
                  </div>
                </CardContent>
              </Card>

              {/* Integration Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="retry-attempts">Default Retry Attempts</Label>
                    <Input id="retry-attempts" type="number" defaultValue="3" />
                  </div>
                  <div>
                    <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                    <Input id="timeout" type="number" defaultValue="30" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-scaling</Label>
                      <p className="text-sm text-gray-500">Automatically scale based on load</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring & Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="alert-threshold">Error Rate Alert Threshold (%)</Label>
                    <Input id="alert-threshold" type="number" defaultValue="5" />
                  </div>
                  <div>
                    <Label htmlFor="response-threshold">Response Time Alert Threshold (ms)</Label>
                    <Input id="response-threshold" type="number" defaultValue="1000" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Slack Notifications</Label>
                      <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Settings */}
            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create API Modal */}
      {showCreateAPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New API</CardTitle>
              <CardDescription>Define your new API endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-name">API Name</Label>
                <Input id="api-name" placeholder="Customer Sync API" />
              </div>
              <div>
                <Label htmlFor="api-description">Description</Label>
                <Textarea id="api-description" placeholder="Synchronizes customer data..." />
              </div>
              <div>
                <Label htmlFor="api-endpoint">Endpoint</Label>
                <Input id="api-endpoint" placeholder="/api/customers/sync" />
              </div>
              <div>
                <Label htmlFor="api-method">Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="POST" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowCreateAPI(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateAPI({})}>Create API</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
