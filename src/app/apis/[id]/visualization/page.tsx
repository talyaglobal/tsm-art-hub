"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  TrendingUp,
  BarChart3,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Settings,
  Download,
  Filter,
  Eye,
  EyeOff,
  Maximize2,
  RefreshCw,
  Play,
  Database,
  Trash2,
  Copy,
  ArrowLeft,
  FileText,
  Share2,
} from "lucide-react"

export default function APIVisualizationPage() {
  const { toast } = useToast()
  const [visualizations, setVisualizations] = useState([
    {
      id: 1,
      name: "API Response Times",
      type: "line",
      dataSource: "testResults",
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      config: {
        xAxis: "timestamp",
        yAxis: "responseTime",
        color: "#3b82f6",
        showGrid: true,
        showLegend: true,
      },
    },
    {
      id: 2,
      name: "Request Distribution",
      type: "pie",
      dataSource: "apiEndpoints",
      isActive: true,
      createdAt: "2024-01-14T09:15:00Z",
      updatedAt: "2024-01-15T11:45:00Z",
      config: {
        valueField: "requestCount",
        labelField: "endpoint",
        color: "#10b981",
        showGrid: false,
        showLegend: true,
      },
    },
    {
      id: 3,
      name: "Error Rate Trends",
      type: "area",
      dataSource: "errorMetrics",
      isActive: false,
      createdAt: "2024-01-13T16:20:00Z",
      updatedAt: "2024-01-14T08:30:00Z",
      config: {
        xAxis: "time",
        yAxis: "errorRate",
        color: "#ef4444",
        showGrid: true,
        showLegend: false,
      },
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [selectedVisualization, setSelectedVisualization] = useState(null)
  const [timeRange, setTimeRange] = useState("24h")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Sample data for visualizations
  const sampleResponseTimeData = [
    { timestamp: "00:00", responseTime: 245, requests: 120, errors: 2 },
    { timestamp: "04:00", responseTime: 189, requests: 98, errors: 1 },
    { timestamp: "08:00", responseTime: 432, requests: 245, errors: 8 },
    { timestamp: "12:00", responseTime: 356, requests: 289, errors: 12 },
    { timestamp: "16:00", responseTime: 298, requests: 198, errors: 5 },
    { timestamp: "20:00", responseTime: 167, requests: 145, errors: 3 },
  ]

  const sampleRequestDistribution = [
    { endpoint: "/api/users", requestCount: 3421, color: "#3b82f6" },
    { endpoint: "/api/auth", requestCount: 2145, color: "#10b981" },
    { endpoint: "/api/orders", requestCount: 1876, color: "#f59e0b" },
    { endpoint: "/api/products", requestCount: 1432, color: "#ef4444" },
    { endpoint: "/api/payments", requestCount: 987, color: "#8b5cf6" },
  ]

  const sampleErrorRateData = [
    { time: "00:00", errorRate: 1.7, errors: 2, total: 120 },
    { time: "04:00", errorRate: 1.0, errors: 1, total: 98 },
    { time: "08:00", errorRate: 3.3, errors: 8, total: 245 },
    { time: "12:00", errorRate: 4.2, errors: 12, total: 289 },
    { time: "16:00", errorRate: 2.5, errors: 5, total: 198 },
    { time: "20:00", errorRate: 2.1, errors: 3, total: 145 },
  ]

  const allData = {
    responseTimeData: sampleResponseTimeData,
    requestDistribution: sampleRequestDistribution,
    errorRateData: sampleErrorRateData,
    apiConfig: {
      name: "User Management API",
      version: "v2.1.0",
      status: "active",
      baseUrl: "https://api.tsmarthub.com",
      ipAddress: "192.168.1.100",
      port: 8080,
      token: "sk_live_51HyVjKLkjhgfdsa32hjkl4h5j6k7l8m9n0p1q2r3s4t5u6v7w8x9y0z",
    },
    visualizations: visualizations,
    metadata: {
      totalRequests: 12847,
      avgResponseTime: 287,
      errorRate: 0.8,
      activeUsers: 1247,
      lastUpdated: new Date().toISOString(),
    },
  }

  const visualizationTypes = [
    {
      type: "line",
      name: "Line Chart",
      icon: TrendingUp,
      description: "Track trends over time",
      useCases: ["Response times", "Request volumes", "Error rates"],
    },
    {
      type: "area",
      name: "Area Chart",
      icon: Activity,
      description: "Show cumulative data patterns",
      useCases: ["Throughput", "Data transfer", "Usage patterns"],
    },
    {
      type: "bar",
      name: "Bar Chart",
      icon: BarChart3,
      description: "Compare different categories",
      useCases: ["Endpoint comparison", "Status codes", "User segments"],
    },
    {
      type: "pie",
      name: "Pie Chart",
      icon: BarChart3,
      description: "Show proportional data",
      useCases: ["Traffic distribution", "Error breakdown", "User types"],
    },
  ]

  const dataSources = [
    { value: "testResults", label: "Test Results", fields: ["responseTime", "statusCode", "timestamp", "endpoint"] },
    { value: "apiMetrics", label: "API Metrics", fields: ["requestCount", "errorRate", "throughput", "latency"] },
    { value: "userActivity", label: "User Activity", fields: ["activeUsers", "sessions", "pageViews", "duration"] },
    { value: "systemHealth", label: "System Health", fields: ["cpuUsage", "memoryUsage", "diskUsage", "networkIO"] },
  ]

  const timeRanges = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ]

  const [newVisualization, setNewVisualization] = useState({
    name: "",
    type: "line",
    dataSource: "testResults",
    config: {
      xAxis: "timestamp",
      yAxis: "responseTime",
      color: "#3b82f6",
      showGrid: true,
      showLegend: true,
    },
  })

  const renderVisualization = (viz) => {
    switch (viz.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleResponseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke={viz.config.color}
                strokeWidth={2}
                dot={{ fill: viz.config.color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleErrorRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke={viz.config.color}
                fill={viz.config.color}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleErrorRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errors" fill={viz.config.color} />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sampleRequestDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="requestCount"
                label={({ endpoint, percent }) => `${endpoint} (${(percent * 100).toFixed(0)}%)`}
              >
                {sampleRequestDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="flex items-center justify-center h-64 text-gray-500">Unsupported chart type</div>
    }
  }

  const handleCreateVisualization = () => {
    if (!newVisualization.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a visualization name.",
        variant: "destructive",
      })
      return
    }

    const visualization = {
      id: Date.now(),
      ...newVisualization,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setVisualizations([...visualizations, visualization])
    setShowCreateModal(false)
    setNewVisualization({
      name: "",
      type: "line",
      dataSource: "testResults",
      config: {
        xAxis: "timestamp",
        yAxis: "responseTime",
        color: "#3b82f6",
        showGrid: true,
        showLegend: true,
      },
    })

    toast({
      title: "Visualization Created",
      description: "New visualization has been added successfully.",
    })
  }

  const toggleVisualization = (id) => {
    setVisualizations(
      visualizations.map((viz) =>
        viz.id === id ? { ...viz, isActive: !viz.isActive, updatedAt: new Date().toISOString() } : viz,
      ),
    )
  }

  const deleteVisualization = (id) => {
    setVisualizations(visualizations.filter((viz) => viz.id !== id))
    toast({
      title: "Visualization Deleted",
      description: "Visualization has been removed successfully.",
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Data has been copied to your clipboard.",
    })
  }

  const exportData = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `${filename} has been downloaded.`,
    })
  }

  const handleBypassLogin = () => {
    toast({
      title: "Login Bypassed",
      description: "You can now access all visualization features without authentication.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to APIs
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <nav className="flex space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Overview
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Metrics
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Logs
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => setShowDataModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                View All Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData(allData, "api-visualization-data.json")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleBypassLogin}>
                🔓 Bypass Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* API Info */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h1 className="text-2xl font-bold text-gray-900">User Management API</h1>
                <Badge className="bg-green-100 text-green-800">active</Badge>
              </div>
              <p className="text-gray-600 mt-1">
                Comprehensive API for managing user accounts, profiles, and authentication
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Version v2.1.0</span>
                <span>•</span>
                <span>Last updated 1/15/2024</span>
              </div>
            </div>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <a href="#" className="flex items-center space-x-2 px-3 py-4 text-gray-600 hover:text-gray-900">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-4 text-gray-600 hover:text-gray-900">
              <Settings className="h-4 w-4" />
              <span>Connection</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-4 text-gray-600 hover:text-gray-900">
              <Play className="h-4 w-4" />
              <span>Testing</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-4 text-gray-600 hover:text-gray-900">
              <Database className="h-4 w-4" />
              <span>Data</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-4 text-gray-600 hover:text-gray-900">
              <AlertTriangle className="h-4 w-4" />
              <span>Triggers</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-3 py-4 text-blue-600 border-b-2 border-blue-600">
              <BarChart3 className="h-4 w-4" />
              <span>Visualization</span>
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Visualization</h2>
            <p className="text-gray-600">Create charts and graphs from your API data</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Visualization
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">287ms</p>
                  <p className="text-xs text-green-600 mt-1">↓ 12% from yesterday</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">12,847</p>
                  <p className="text-xs text-green-600 mt-1">↑ 8% from yesterday</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">0.8%</p>
                  <p className="text-xs text-red-600 mt-1">↑ 0.2% from yesterday</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-green-600 mt-1">↑ 15% from yesterday</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualizations Grid */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Visualizations</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visualizations
              .filter((viz) => viz.isActive)
              .map((viz) => (
                <Card key={viz.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{viz.name}</CardTitle>
                        <CardDescription>Data Source: {viz.dataSource}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleVisualization(viz.id)}>
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderVisualization(viz)}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(viz.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(viz.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Hidden Visualizations */}
          {visualizations.some((viz) => !viz.isActive) && (
            <div className="mt-8">
              <h4 className="text-md font-medium text-gray-700 mb-4">Hidden Visualizations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visualizations
                  .filter((viz) => !viz.isActive)
                  .map((viz) => (
                    <Card key={viz.id} className="bg-gray-50 border-dashed border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{viz.name}</h5>
                            <p className="text-sm text-gray-600">{viz.type} chart</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleVisualization(viz.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteVisualization(viz.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Visualization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Visualization</h2>
              <p className="text-gray-600">Choose the best chart type for your data</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <Label htmlFor="vizName">Visualization Name</Label>
                <Input
                  id="vizName"
                  value={newVisualization.name}
                  onChange={(e) => setNewVisualization({ ...newVisualization, name: e.target.value })}
                  placeholder="e.g., API Response Time Trends"
                />
              </div>

              {/* Chart Type Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4">Chart Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {visualizationTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Button
                        key={type.type}
                        variant={newVisualization.type === type.type ? "default" : "outline"}
                        onClick={() => setNewVisualization({ ...newVisualization, type: type.type })}
                        className="p-4 h-auto justify-start"
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-6 w-6 mt-1" />
                          <div className="text-left">
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm opacity-70 mt-1">{type.description}</p>
                            <div className="mt-2">
                              <p className="text-xs opacity-60">Best for:</p>
                              <ul className="text-xs opacity-60 mt-1">
                                {type.useCases.slice(0, 2).map((useCase, index) => (
                                  <li key={index}>• {useCase}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Data Source */}
              <div>
                <Label>Data Source</Label>
                <Select
                  value={newVisualization.dataSource}
                  onValueChange={(value) => setNewVisualization({ ...newVisualization, dataSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Axis Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>X-Axis Field</Label>
                  <Select
                    value={newVisualization.config.xAxis}
                    onValueChange={(value) =>
                      setNewVisualization({
                        ...newVisualization,
                        config: { ...newVisualization.config, xAxis: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources
                        .find((s) => s.value === newVisualization.dataSource)
                        ?.fields.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Y-Axis Field</Label>
                  <Select
                    value={newVisualization.config.yAxis}
                    onValueChange={(value) =>
                      setNewVisualization({
                        ...newVisualization,
                        config: { ...newVisualization.config, yAxis: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources
                        .find((s) => s.value === newVisualization.dataSource)
                        ?.fields.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Style Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={newVisualization.config.color}
                    onChange={(e) =>
                      setNewVisualization({
                        ...newVisualization,
                        config: { ...newVisualization.config, color: e.target.value },
                      })
                    }
                    className="h-10"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newVisualization.config.showGrid}
                      onChange={(e) =>
                        setNewVisualization({
                          ...newVisualization,
                          config: { ...newVisualization.config, showGrid: e.target.checked },
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show Grid</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newVisualization.config.showLegend}
                      onChange={(e) =>
                        setNewVisualization({
                          ...newVisualization,
                          config: { ...newVisualization.config, showLegend: e.target.checked },
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show Legend</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVisualization}>Create Visualization</Button>
            </div>
          </div>
        </div>
      )}

      {/* View All Data Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Visualization Data</h2>
                  <p className="text-gray-600">Complete dataset including API config and metrics</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(allData, null, 2))}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportData(allData, "complete-api-data.json")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(allData, null, 2)}</pre>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setShowDataModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
