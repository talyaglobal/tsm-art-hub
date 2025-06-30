"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  MoreVertical,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Copy,
  Server,
  List,
  Grid,
  Table,
  Play,
  Pause,
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Settings,
  BarChart3,
} from "lucide-react"

interface API {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "maintenance"
  health: "healthy" | "warning" | "critical"
  endpoint: string
  method: string
  version: string
  lastUpdated: string
  requests: number
  responseTime: number
  successRate: number
  uptime: number
  ipAddress: string
  port: number
  baseUrl: string
  token: string
  authentication: string
  tags: string[]
  connections: number
  lastTested: string
}

interface Trigger {
  id: number
  name: string
  status: "active" | "paused"
  condition: string
  channels: string[]
  severity: "low" | "medium" | "high" | "critical"
  lastTriggered: string
  description?: string
  triggerType: string
  conditions: {
    metric: string
    operator: string
    value: string
    duration: string
  }
  schedule: string
}

export default function APIsPage() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"card" | "list" | "table">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("apis")
  const [showCreateTrigger, setShowCreateTrigger] = useState(false)

  // Trigger System State
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: 1,
      name: "API Response Time Alert",
      status: "active",
      condition: "response_time > 5000ms",
      channels: ["whatsapp", "email"],
      severity: "high",
      lastTriggered: "2 hours ago",
      description: "Monitor API response times and alert when they exceed threshold",
      triggerType: "api_monitoring",
      conditions: {
        metric: "response_time",
        operator: "greater_than",
        value: "5000",
        duration: "5",
      },
      schedule: "immediate",
    },
    {
      id: 2,
      name: "Payment Gateway Down",
      status: "active",
      condition: "status_code >= 500",
      channels: ["sms", "whatsapp", "email"],
      severity: "critical",
      lastTriggered: "Never",
      description: "Critical alert for payment gateway failures",
      triggerType: "error_rate",
      conditions: {
        metric: "status_code",
        operator: "greater_than",
        value: "500",
        duration: "1",
      },
      schedule: "immediate",
    },
    {
      id: 3,
      name: "High Traffic Spike",
      status: "paused",
      condition: "requests_per_minute > 1000",
      channels: ["email"],
      severity: "medium",
      lastTriggered: "1 day ago",
      description: "Monitor for unusual traffic spikes",
      triggerType: "traffic_spike",
      conditions: {
        metric: "requests_per_minute",
        operator: "greater_than",
        value: "1000",
        duration: "10",
      },
      schedule: "immediate",
    },
  ])

  const [newTrigger, setNewTrigger] = useState<Partial<Trigger>>({
    name: "",
    description: "",
    triggerType: "api_monitoring",
    conditions: {
      metric: "response_time",
      operator: "greater_than",
      value: "",
      duration: "5",
    },
    channels: [],
    severity: "medium",
    schedule: "immediate",
  })

  const apis: API[] = [
    {
      id: "api_1",
      name: "User Management API",
      description: "Handles user authentication, profiles, and permissions",
      status: "active",
      health: "healthy",
      endpoint: "/api/v2/users",
      method: "REST",
      version: "v2.1.0",
      lastUpdated: "2024-01-15T10:30:00Z",
      requests: 125000,
      responseTime: 145,
      successRate: 99.8,
      uptime: 99.95,
      ipAddress: "192.168.1.100",
      port: 8080,
      baseUrl: "https://api.tsmarthub.com",
      token: "sk_live_51HyVjKLkjhgfdsa32hjkl4h5j6k7l8m9n0p1q2r3s4t5u6v7w8x9y0z",
      authentication: "Bearer Token",
      tags: ["authentication", "users", "core"],
      connections: 847,
      lastTested: "5 minutes ago",
    },
    {
      id: "api_2",
      name: "Payment Processing API",
      description: "Secure payment processing and transaction management",
      status: "active",
      health: "warning",
      endpoint: "/api/v1/payments",
      method: "REST",
      version: "v1.8.2",
      lastUpdated: "2024-01-14T15:45:00Z",
      requests: 89000,
      responseTime: 320,
      successRate: 98.2,
      uptime: 99.1,
      ipAddress: "192.168.1.101",
      port: 8081,
      baseUrl: "https://payments.tsmarthub.com",
      token: "sk_live_62IwXmNOkjhgfdsa43ijkl5i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y",
      authentication: "API Key",
      tags: ["payments", "transactions", "finance"],
      connections: 523,
      lastTested: "12 minutes ago",
    },
    {
      id: "api_3",
      name: "Analytics & Reporting API",
      description: "Business intelligence and data analytics endpoints",
      status: "maintenance",
      health: "critical",
      endpoint: "/api/v3/analytics",
      method: "GraphQL",
      version: "v3.0.1",
      lastUpdated: "2024-01-13T09:20:00Z",
      requests: 45000,
      responseTime: 890,
      successRate: 95.5,
      uptime: 97.8,
      ipAddress: "192.168.1.102",
      port: 8082,
      baseUrl: "https://analytics.tsmarthub.com",
      token: "sk_live_73JxYnPQkjhgfdsa54jklm6j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z",
      authentication: "OAuth 2.0",
      tags: ["analytics", "reporting", "data"],
      connections: 234,
      lastTested: "2 hours ago",
    },
    {
      id: "api_4",
      name: "Notification Service API",
      description: "Multi-channel notification delivery system",
      status: "active",
      health: "healthy",
      endpoint: "/api/v1/notifications",
      method: "REST",
      version: "v1.5.3",
      lastUpdated: "2024-01-12T14:10:00Z",
      requests: 67000,
      responseTime: 95,
      successRate: 99.9,
      uptime: 99.99,
      ipAddress: "192.168.1.103",
      port: 8083,
      baseUrl: "https://notify.tsmarthub.com",
      token: "sk_live_84KyZoQRkjhgfdsa65klmn7k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a",
      authentication: "Bearer Token",
      tags: ["notifications", "messaging", "alerts"],
      connections: 1205,
      lastTested: "1 minute ago",
    },
  ]

  const triggerTypes = [
    { value: "api_monitoring", label: "API Monitoring", icon: Activity },
    { value: "error_rate", label: "Error Rate Threshold", icon: AlertTriangle },
    { value: "traffic_spike", label: "Traffic Spike Detection", icon: Activity },
    { value: "service_health", label: "Service Health Check", icon: CheckCircle },
    { value: "custom_metric", label: "Custom Metric", icon: Settings },
  ]

  const metrics = {
    api_monitoring: ["response_time", "status_code", "throughput", "error_count"],
    error_rate: ["error_percentage", "failed_requests", "timeout_rate"],
    traffic_spike: ["requests_per_minute", "concurrent_users", "bandwidth_usage"],
    service_health: ["uptime_percentage", "health_score", "dependency_status"],
    custom_metric: ["custom_value", "business_metric", "kpi_threshold"],
  }

  const operators = [
    { value: "greater_than", label: "Greater than (>)" },
    { value: "less_than", label: "Less than (<)" },
    { value: "equals", label: "Equals (=)" },
    { value: "not_equals", label: "Not equals (≠)" },
    { value: "contains", label: "Contains" },
    { value: "between", label: "Between" },
  ]

  const channels = [
    { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-green-600" },
    { value: "sms", label: "SMS", icon: Smartphone, color: "text-blue-600" },
    { value: "email", label: "Email", icon: Mail, color: "text-purple-600" },
  ]

  const severityLevels = [
    { value: "low", label: "Low", color: "bg-yellow-100 text-yellow-800" },
    { value: "medium", label: "Medium", color: "bg-orange-100 text-orange-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
    { value: "critical", label: "Critical", color: "bg-red-200 text-red-900" },
  ]

  const filteredAPIs = apis.filter((api) => {
    const matchesSearch =
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || api.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <XCircle className="h-4 w-4" />
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    const level = severityLevels.find((s) => s.value === severity)
    return level ? level.color : "bg-gray-100 text-gray-800"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Text has been copied to your clipboard.",
    })
  }

  const handleCreateTrigger = () => {
    if (!newTrigger.name || !newTrigger.conditions?.value || !newTrigger.channels?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const trigger: Trigger = {
      id: Date.now(),
      name: newTrigger.name,
      status: "active",
      condition: `${newTrigger.conditions?.metric} ${newTrigger.conditions?.operator.replace("_", " ")} ${newTrigger.conditions?.value}`,
      channels: newTrigger.channels || [],
      severity: newTrigger.severity || "medium",
      lastTriggered: "Never",
      description: newTrigger.description || "",
      triggerType: newTrigger.triggerType || "api_monitoring",
      conditions: newTrigger.conditions || {
        metric: "response_time",
        operator: "greater_than",
        value: "",
        duration: "5",
      },
      schedule: newTrigger.schedule || "immediate",
    }

    setTriggers([...triggers, trigger])
    setShowCreateTrigger(false)
    setNewTrigger({
      name: "",
      description: "",
      triggerType: "api_monitoring",
      conditions: {
        metric: "response_time",
        operator: "greater_than",
        value: "",
        duration: "5",
      },
      channels: [],
      severity: "medium",
      schedule: "immediate",
    })

    toast({
      title: "Trigger Created",
      description: "New trigger has been created successfully.",
    })
  }

  const toggleTriggerStatus = (id: number) => {
    setTriggers(
      triggers.map((trigger) =>
        trigger.id === id ? { ...trigger, status: trigger.status === "active" ? "paused" : "active" } : trigger,
      ),
    )
  }

  const deleteTrigger = (id: number) => {
    setTriggers(triggers.filter((trigger) => trigger.id !== id))
    toast({
      title: "Trigger Deleted",
      description: "Trigger has been removed successfully.",
    })
  }

  const renderListView = () => (
    <div className="space-y-4">
      {filteredAPIs.map((api) => (
        <Card key={api.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 min-w-0 w-full lg:w-auto">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(api.status)}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{api.name}</h3>
                      </div>
                      <Badge className={getStatusColor(api.status)}>{api.status}</Badge>
                      <Badge className={getHealthColor(api.health)}>{api.health}</Badge>
                      <Badge variant="outline">{api.method}</Badge>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{api.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-sm">
                        <Label className="text-gray-500">Requests</Label>
                        <p className="font-medium">{api.requests.toLocaleString()}</p>
                      </div>
                      <div className="text-sm">
                        <Label className="text-gray-500">Response Time</Label>
                        <p className="font-medium">{api.responseTime}ms</p>
                      </div>
                      <div className="text-sm">
                        <Label className="text-gray-500">Success Rate</Label>
                        <p className="font-medium">{api.successRate}%</p>
                      </div>
                      <div className="text-sm">
                        <Label className="text-gray-500">Uptime</Label>
                        <p className="font-medium">{api.uptime}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-sm">
                        <Label className="text-gray-500">IP Address & Port</Label>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {api.ipAddress}:{api.port}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${api.ipAddress}:${api.port}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <Label className="text-gray-500">Base URL</Label>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded truncate">{api.baseUrl}</p>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(api.baseUrl)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <Label className="text-gray-500">API Token</Label>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {api.token.substring(0, 20)}...
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(api.token)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{api.connections} connections</span>
                        <span>•</span>
                        <span>Last tested: {api.lastTested}</span>
                        <span>•</span>
                        <span>Version {api.version}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {api.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-w-0 bg-transparent">
                    <Eye className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-w-0 bg-transparent">
                    <Edit className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-w-0 bg-transparent">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTriggerSystem = () => (
    <div className="space-y-6">
      {/* Trigger Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggers.filter((t) => t.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {triggers.filter((t) => t.status === "paused").length} paused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Sent (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Avg alert response</p>
          </CardContent>
        </Card>
      </div>

      {/* Triggers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trigger Management</CardTitle>
              <CardDescription>Configure automated alerts and monitoring rules</CardDescription>
            </div>
            <Button onClick={() => setShowCreateTrigger(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trigger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{trigger.name}</h4>
                      <Badge className={getSeverityColor(trigger.severity)}>{trigger.severity.toUpperCase()}</Badge>
                      <Badge
                        className={
                          trigger.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {trigger.status === "active" ? "ACTIVE" : "PAUSED"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Condition: {trigger.condition}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Channels:</span>
                        <div className="flex space-x-1">
                          {trigger.channels.map((channel) => {
                            const channelInfo = channels.find((c) => c.value === channel)
                            if (!channelInfo) return null
                            const Icon = channelInfo.icon
                            return (
                              <div key={channel} className={`p-1 rounded ${channelInfo.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">Last triggered: {trigger.lastTriggered}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => toggleTriggerStatus(trigger.id)}>
                      {trigger.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTrigger(trigger.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Situation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Situation Analysis</CardTitle>
          <CardDescription>Real-time monitoring and incident detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Payment Gateway Latency Spike</p>
                <p className="text-sm text-gray-600">
                  Response times increased by 150% in the last hour. Affecting checkout completion rates.
                </p>
                <p className="text-xs text-gray-500 mt-1">Detected 15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">API Traffic Pattern Anomaly</p>
                <p className="text-sm text-gray-600">
                  Unusual traffic pattern detected from region: EU-West. 40% above normal baseline.
                </p>
                <p className="text-xs text-gray-500 mt-1">Detected 8 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">System Recovery Confirmed</p>
                <p className="text-sm text-gray-600">
                  Database connection pool has stabilized. All services operating within normal parameters.
                </p>
                <p className="text-xs text-gray-500 mt-1">Resolved 2 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
              <p className="text-gray-600">Monitor and manage your API ecosystem</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                onClick={() => {
                  toast({
                    title: "Login Bypassed",
                    description: "You can now access all API management features without authentication.",
                  })
                }}
              >
                🔓 Bypass Login
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add API
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="apis">API Overview</TabsTrigger>
            <TabsTrigger value="triggers">Trigger System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="apis" className="space-y-6">
            {/* Filters and View Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search APIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "card" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API List */}
            {renderListView()}
          </TabsContent>

          <TabsContent value="triggers" className="space-y-6">
            {renderTriggerSystem()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apis.length}</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apis.reduce((sum, api) => sum + api.requests, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(apis.reduce((sum, api) => sum + api.responseTime, 0) / apis.length)}ms
                  </div>
                  <p className="text-xs text-muted-foreground">-15ms from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(apis.reduce((sum, api) => sum + api.successRate, 0) / apis.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">+0.3% from last week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Performance Overview</CardTitle>
                <CardDescription>Real-time performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Performance charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Trigger Modal */}
      {showCreateTrigger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Trigger</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="triggerName">Trigger Name</Label>
                  <Input
                    id="triggerName"
                    value={newTrigger.name || ""}
                    onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                    placeholder="e.g., High Response Time Alert"
                  />
                </div>

                <div>
                  <Label htmlFor="triggerDescription">Description</Label>
                  <Input
                    id="triggerDescription"
                    value={newTrigger.description || ""}
                    onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
                    placeholder="Describe what this trigger monitors..."
                  />
                </div>
              </div>

              {/* Trigger Type */}
              <div>
                <Label>Trigger Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {triggerTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Button
                        key={type.value}
                        variant={newTrigger.triggerType === type.value ? "default" : "outline"}
                        onClick={() => setNewTrigger({ ...newTrigger, triggerType: type.value })}
                        className="justify-start"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Trigger Conditions</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Metric</Label>
                    <Select
                      value={newTrigger.conditions?.metric}
                      onValueChange={(value) =>
                        setNewTrigger({
                          ...newTrigger,
                          conditions: { ...newTrigger.conditions!, metric: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {metrics[newTrigger.triggerType as keyof typeof metrics]?.map((metric) => (
                          <SelectItem key={metric} value={metric}>
                            {metric.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Operator</Label>
                    <Select
                      value={newTrigger.conditions?.operator}
                      onValueChange={(value) =>
                        setNewTrigger({
                          ...newTrigger,
                          conditions: { ...newTrigger.conditions!, operator: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Value</Label>
                    <Input
                      value={newTrigger.conditions?.value || ""}
                      onChange={(e) =>
                        setNewTrigger({
                          ...newTrigger,
                          conditions: { ...newTrigger.conditions!, value: e.target.value },
                        })
                      }
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newTrigger.conditions?.duration || ""}
                    onChange={(e) =>
                      setNewTrigger({
                        ...newTrigger,
                        conditions: { ...newTrigger.conditions!, duration: e.target.value },
                      })
                    }
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Alert Channels */}
              <div>
                <Label>Alert Channels</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {channels.map((channel) => {
                    const Icon = channel.icon
                    const isSelected = newTrigger.channels?.includes(channel.value)
                    return (
                      <Button
                        key={channel.value}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          const newChannels = isSelected
                            ? newTrigger.channels?.filter((c) => c !== channel.value) || []
                            : [...(newTrigger.channels || []), channel.value]
                          setNewTrigger({ ...newTrigger, channels: newChannels })
                        }}
                        className="justify-start"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {channel.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Severity */}
              <div>
                <Label>Severity Level</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {severityLevels.map((level) => (
                    <Button
                      key={level.value}
                      variant={newTrigger.severity === level.value ? "default" : "outline"}
                      onClick={() => setNewTrigger({ ...newTrigger, severity: level.value as any })}
                      className="justify-center"
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateTrigger(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTrigger}>Create Trigger</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
