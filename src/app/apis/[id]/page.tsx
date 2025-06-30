"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Activity,
  Settings,
  BarChart3,
  FileText,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Download,
  Eye,
  Copy,
  Server,
  Database,
  Zap,
  LineChart,
  RefreshCw,
} from "lucide-react"

interface ApiDetails {
  id: string
  name: string
  description: string
  version: string
  status: "active" | "inactive" | "maintenance"
  endpoint: string
  method: string
  lastUpdated: string
  totalRequests: number
  successRate: number
  avgResponseTime: number
  activeUsers: number
  rateLimit: number
  authentication: string
  documentation: string
  ipAddress: string
  token: string
  port: number
}

interface TestData {
  [key: string]: any
}

interface ApiResponse {
  status: number
  data: any
  headers: Record<string, string>
  responseTime: number
  timestamp: string
}

export default function ApiDetailsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [api, setApi] = useState<ApiDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [testData, setTestData] = useState<TestData>({})
  const [testResults, setTestResults] = useState<ApiResponse[]>([])
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [showDataWindow, setShowDataWindow] = useState(false)
  const [jsonData, setJsonData] = useState("")
  const [triggers, setTriggers] = useState<any[]>([])
  const [visualizations, setVisualizations] = useState<any[]>([])

  // Configuration form state
  const [config, setConfig] = useState({
    rateLimit: "",
    timeout: "",
    retries: "",
    caching: false,
    logging: true,
    monitoring: true,
    authentication: "",
    cors: true,
    compression: false,
  })

  useEffect(() => {
    const loadApiDetails = () => {
      // Mock API data with IP and token
      const mockApi: ApiDetails = {
        id: params.id as string,
        name: "User Management API",
        description: "Comprehensive API for managing user accounts, profiles, and authentication",
        version: "v2.1.0",
        status: "active",
        endpoint: "/api/v2/users",
        method: "REST",
        lastUpdated: "2024-01-15T10:30:00Z",
        totalRequests: 1250000,
        successRate: 99.8,
        avgResponseTime: 145,
        activeUsers: 2847,
        rateLimit: 1000,
        authentication: "Bearer Token",
        documentation: "https://docs.example.com/api/users",
        ipAddress: "192.168.1.100",
        token: "sk_live_51HyVjKLkjhgfdsa32hjkl4h5j6k7l8m9n0p1q2r3s4t5u6v7w8x9y0z",
        port: 8080,
      }

      setApi(mockApi)
      setConfig({
        rateLimit: mockApi.rateLimit.toString(),
        timeout: "30000",
        retries: "3",
        caching: true,
        logging: true,
        monitoring: true,
        authentication: mockApi.authentication,
        cors: true,
        compression: true,
      })
      setIsLoading(false)
    }

    setTimeout(loadApiDetails, 800)
  }, [params.id])

  const handleConfigChange = (field: string, value: string | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "API configuration has been updated successfully.",
    })
  }

  const handleTestDataChange = (field: string, value: string) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTestApi = async () => {
    setIsTestingApi(true)

    // Simulate API test
    setTimeout(() => {
      const mockResponse: ApiResponse = {
        status: 200,
        data: {
          users: [
            { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
            { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
            { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "manager" },
          ],
          pagination: {
            total: 150,
            page: 1,
            limit: 10,
            totalPages: 15,
          },
          metadata: {
            requestId: "req_" + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            version: "v2.1.0",
          },
        },
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "999",
          "X-Response-Time": "145ms",
        },
        responseTime: 145,
        timestamp: new Date().toISOString(),
      }

      setTestResults((prev) => [mockResponse, ...prev])
      setIsTestingApi(false)
      setShowDataWindow(true)

      toast({
        title: "API Test Successful",
        description: "API responded successfully with test data.",
      })
    }, 2000)
  }

  const handleExportToJson = () => {
    const exportData = {
      api: api,
      testResults: testResults,
      configuration: config,
      triggers: triggers,
      visualizations: visualizations,
      exportTimestamp: new Date().toISOString(),
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    setJsonData(jsonString)

    // Create download link
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${api?.name.replace(/\s+/g, "_").toLowerCase()}_export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "JSON Export Complete",
      description: "API data has been exported to JSON file successfully.",
    })
  }

  const addTrigger = () => {
    const newTrigger = {
      id: Date.now(),
      name: "New Trigger",
      condition: "response.status === 200",
      action: "log",
      enabled: true,
    }
    setTriggers((prev) => [...prev, newTrigger])
  }

  const addVisualization = () => {
    const newVisualization = {
      id: Date.now(),
      type: "chart",
      title: "API Response Times",
      dataSource: "testResults",
      chartType: "line",
      enabled: true,
    }
    setVisualizations((prev) => [...prev, newVisualization])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Text has been copied to your clipboard.",
    })
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API details...</p>
        </div>
      </div>
    )
  }

  if (!api) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">API Not Found</h2>
          <p className="text-gray-600">The requested API could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(api.status)}
                <Badge className={getStatusColor(api.status)}>{api.status}</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{api.name}</h1>
                <p className="text-gray-600 mt-1">{api.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Version {api.version}</span>
                  <span>•</span>
                  <span>Last updated {new Date(api.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Settings className="h-4 w-4 mr-2" />
                Bypass Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="connection" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Connection</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Testing</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Data</span>
            </TabsTrigger>
            <TabsTrigger value="triggers" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Triggers</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Visualization</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{api.totalRequests.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{api.successRate}%</div>
                  <p className="text-xs text-muted-foreground">+0.2% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{api.avgResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">-5ms from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{api.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* API Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Information</CardTitle>
                  <CardDescription>Basic details about this API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Endpoint</Label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{api.endpoint}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Method</Label>
                      <p className="text-sm">{api.method}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Authentication</Label>
                      <p className="text-sm">{api.authentication}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Rate Limit</Label>
                      <p className="text-sm">{api.rateLimit} req/min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest API usage and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">High traffic detected</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Configuration updated</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Rate limit warning</p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
                <CardDescription>API connection information and credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">IP Address</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input value={api.ipAddress} readOnly className="font-mono" />
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(api.ipAddress)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Port</Label>
                      <Input value={api.port.toString()} readOnly className="font-mono mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Base URL</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={`http://${api.ipAddress}:${api.port}${api.endpoint}`}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`http://${api.ipAddress}:${api.port}${api.endpoint}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">API Token</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input value={api.token} readOnly type="password" className="font-mono" />
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(api.token)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Authentication Type</Label>
                      <Input value={api.authentication} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(api.status)}>
                          {getStatusIcon(api.status)}
                          <span className="ml-1">{api.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Testing</CardTitle>
                  <CardDescription>Test your API with custom data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="testEndpoint">Test Endpoint</Label>
                    <Input
                      id="testEndpoint"
                      value={`${api.endpoint}/test`}
                      onChange={(e) => handleTestDataChange("endpoint", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testMethod">HTTP Method</Label>
                    <Select defaultValue="GET">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="testHeaders">Headers (JSON)</Label>
                    <Textarea
                      id="testHeaders"
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                      value={testData.headers || ""}
                      onChange={(e) => handleTestDataChange("headers", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testBody">Request Body (JSON)</Label>
                    <Textarea
                      id="testBody"
                      placeholder='{"name": "John Doe", "email": "john@example.com"}'
                      value={testData.body || ""}
                      onChange={(e) => handleTestDataChange("body", e.target.value)}
                      className="font-mono"
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleTestApi} disabled={isTestingApi} className="w-full">
                    {isTestingApi ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing API...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test API
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>Recent API test responses</CardDescription>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No test results yet. Run a test to see results here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {testResults.slice(0, 3).map((result, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              className={
                                result.status === 200 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {result.status}
                            </Badge>
                            <span className="text-sm text-gray-500">{result.responseTime}ms</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{new Date(result.timestamp).toLocaleString()}</p>
                          <Button variant="outline" size="sm" onClick={() => setShowDataWindow(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>View and export API data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Test Results Data</h4>
                    <p className="text-sm text-gray-500">{testResults.length} test results available</p>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={showDataWindow} onOpenChange={setShowDataWindow}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View All Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>API Test Data</DialogTitle>
                          <DialogDescription>Complete view of all API test results and responses</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {testResults.map((result, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">Test Result #{index + 1}</h4>
                                <Badge
                                  className={
                                    result.status === 200 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }
                                >
                                  Status: {result.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label className="text-sm font-medium">Response Time</Label>
                                  <p className="text-sm">{result.responseTime}ms</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Timestamp</Label>
                                  <p className="text-sm">{new Date(result.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Response Data</Label>
                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={handleExportToJson}>
                      <Download className="h-4 w-4 mr-2" />
                      Export to JSON
                    </Button>
                  </div>
                </div>

                {testResults.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Data Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Total Records</Label>
                        <p className="font-medium">
                          {testResults.reduce((acc, result) => acc + (result.data.users?.length || 0), 0)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Success Rate</Label>
                        <p className="font-medium">
                          {((testResults.filter((r) => r.status === 200).length / testResults.length) * 100).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Avg Response Time</Label>
                        <p className="font-medium">
                          {(
                            testResults.reduce((acc, result) => acc + result.responseTime, 0) / testResults.length
                          ).toFixed(0)}
                          ms
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Triggers</CardTitle>
                <CardDescription>Configure automated actions based on API responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Active Triggers</h4>
                  <Button onClick={addTrigger}>
                    <Zap className="h-4 w-4 mr-2" />
                    Add Trigger
                  </Button>
                </div>

                {triggers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No triggers configured. Add a trigger to automate actions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {triggers.map((trigger) => (
                      <div key={trigger.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{trigger.name}</h5>
                          <Switch checked={trigger.enabled} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-gray-500">Condition</Label>
                            <p className="font-mono bg-gray-100 p-1 rounded">{trigger.condition}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Action</Label>
                            <p>{trigger.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Visualization</CardTitle>
                <CardDescription>Create charts and graphs from your API data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Visualizations</h4>
                  <Button onClick={addVisualization}>
                    <LineChart className="h-4 w-4 mr-2" />
                    Add Visualization
                  </Button>
                </div>

                {visualizations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No visualizations created. Add a chart to visualize your data.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visualizations.map((viz) => (
                      <div key={viz.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium">{viz.title}</h5>
                          <Switch checked={viz.enabled} />
                        </div>
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <LineChart className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">{viz.chartType} Chart Preview</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">Data Source: {viz.dataSource}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
