"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Save,
  Copy,
  Download,
  Upload,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Send,
  History,
  BookOpen,
} from "lucide-react"

interface ApiTest {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  url: string
  headers: Record<string, string>
  body: string
  expectedStatus: number
  lastRun: string
  status: "success" | "failed" | "pending" | "never"
  responseTime?: number
}

interface TestResult {
  id: string
  testId: string
  timestamp: string
  status: "success" | "failed"
  responseTime: number
  statusCode: number
  response: any
  error?: string
}

export default function TestingPage() {
  const [tests, setTests] = useState<ApiTest[]>([])
  const [results, setResults] = useState<TestResult[]>([])
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [currentRequest, setCurrentRequest] = useState({
    method: "GET" as const,
    url: "https://api.tsmarthub.com/v1/integrations",
    headers: { Authorization: "Bearer YOUR_API_KEY", "Content-Type": "application/json" },
    body: "",
  })
  const [response, setResponse] = useState<any>(null)

  useEffect(() => {
    loadTestData()
  }, [])

  const loadTestData = async () => {
    try {
      // Simulate API calls
      const mockTests: ApiTest[] = [
        {
          id: "1",
          name: "Get All Integrations",
          method: "GET",
          url: "https://api.tsmarthub.com/v1/integrations",
          headers: { Authorization: "Bearer sk_test_123", "Content-Type": "application/json" },
          body: "",
          expectedStatus: 200,
          lastRun: "2024-01-20T14:30:00Z",
          status: "success",
          responseTime: 145,
        },
        {
          id: "2",
          name: "Create New Integration",
          method: "POST",
          url: "https://api.tsmarthub.com/v1/integrations",
          headers: { Authorization: "Bearer sk_test_123", "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              name: "Test Integration",
              type: "ecommerce",
              provider: "shopify",
              config: { endpoint: "https://test.myshopify.com" },
            },
            null,
            2,
          ),
          expectedStatus: 201,
          lastRun: "2024-01-20T14:25:00Z",
          status: "success",
          responseTime: 234,
        },
        {
          id: "3",
          name: "Get Integration Details",
          method: "GET",
          url: "https://api.tsmarthub.com/v1/integrations/123",
          headers: { Authorization: "Bearer sk_test_123", "Content-Type": "application/json" },
          body: "",
          expectedStatus: 200,
          lastRun: "2024-01-20T14:20:00Z",
          status: "failed",
          responseTime: 5000,
        },
      ]

      const mockResults: TestResult[] = [
        {
          id: "1",
          testId: "1",
          timestamp: "2024-01-20T14:30:00Z",
          status: "success",
          responseTime: 145,
          statusCode: 200,
          response: {
            success: true,
            data: {
              integrations: [
                { id: "1", name: "Shopify Store", type: "ecommerce", status: "active" },
                { id: "2", name: "QuickBooks", type: "accounting", status: "active" },
              ],
              count: 2,
            },
          },
        },
        {
          id: "2",
          testId: "3",
          timestamp: "2024-01-20T14:20:00Z",
          status: "failed",
          responseTime: 5000,
          statusCode: 404,
          response: { success: false, error: { code: "NOT_FOUND", message: "Integration not found" } },
          error: "Integration with ID 123 does not exist",
        },
      ]

      setTests(mockTests)
      setResults(mockResults)
    } catch (error) {
      console.error("Failed to load test data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const runTest = async (test?: ApiTest) => {
    setIsRunning(true)
    setResponse(null)

    const testToRun = test || {
      method: currentRequest.method,
      url: currentRequest.url,
      headers: currentRequest.headers,
      body: currentRequest.body,
    }

    try {
      const startTime = Date.now()

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 500))

      const responseTime = Date.now() - startTime
      const success = Math.random() > 0.2 // 80% success rate

      const mockResponse = {
        status: success ? 200 : 500,
        statusText: success ? "OK" : "Internal Server Error",
        data: success
          ? {
              success: true,
              data: {
                message: "API call successful",
                timestamp: new Date().toISOString(),
                method: testToRun.method,
                url: testToRun.url,
              },
            }
          : {
              success: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong",
              },
            },
        responseTime,
      }

      setResponse(mockResponse)

      // Update test status if running a saved test
      if (test) {
        setTests(
          tests.map((t) =>
            t.id === test.id
              ? { ...t, status: success ? "success" : "failed", lastRun: new Date().toISOString(), responseTime }
              : t,
          ),
        )
      }
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: { error: "Failed to connect to API" },
        responseTime: 0,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const saveTest = () => {
    const newTest: ApiTest = {
      id: Date.now().toString(),
      name: `${currentRequest.method} Test`,
      method: currentRequest.method,
      url: currentRequest.url,
      headers: currentRequest.headers,
      body: currentRequest.body,
      expectedStatus: 200,
      lastRun: "Never",
      status: "never",
    }

    setTests([newTest, ...tests])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <TestTube className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API testing interface...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Testing</h1>
              <p className="text-gray-600">Test and debug your API endpoints in real-time</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Collection
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Tests
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="playground" className="space-y-6">
          <TabsList>
            <TabsTrigger value="playground">API Playground</TabsTrigger>
            <TabsTrigger value="saved-tests">Saved Tests</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
            <TabsTrigger value="docs">API Documentation</TabsTrigger>
          </TabsList>

          {/* API Playground */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Request
                  </CardTitle>
                  <CardDescription>Configure and send API requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Method and URL */}
                    <div className="flex space-x-2">
                      <Select
                        value={currentRequest.method}
                        onValueChange={(value: any) => setCurrentRequest({ ...currentRequest, method: value })}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Enter API URL"
                        value={currentRequest.url}
                        onChange={(e) => setCurrentRequest({ ...currentRequest, url: e.target.value })}
                        className="flex-1"
                      />
                    </div>

                    {/* Headers */}
                    <div>
                      <Label>Headers</Label>
                      <Textarea
                        placeholder="Enter headers as JSON"
                        value={JSON.stringify(currentRequest.headers, null, 2)}
                        onChange={(e) => {
                          try {
                            const headers = JSON.parse(e.target.value)
                            setCurrentRequest({ ...currentRequest, headers })
                          } catch (error) {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Body */}
                    {["POST", "PUT", "PATCH"].includes(currentRequest.method) && (
                      <div>
                        <Label>Request Body</Label>
                        <Textarea
                          placeholder="Enter request body (JSON)"
                          value={currentRequest.body}
                          onChange={(e) => setCurrentRequest({ ...currentRequest, body: e.target.value })}
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button onClick={() => runTest()} disabled={isRunning || !currentRequest.url} className="flex-1">
                        {isRunning ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Send Request
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={saveTest}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Response
                  </CardTitle>
                  <CardDescription>API response details</CardDescription>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <Badge variant={response.status >= 400 ? "destructive" : "default"}>
                          {response.status} {response.statusText}
                        </Badge>
                        <span className="text-sm text-gray-600">{response.responseTime}ms</span>
                      </div>

                      {/* Response Body */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Response Body</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={JSON.stringify(response.data, null, 2)}
                          readOnly
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Send a request to see the response</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Tests */}
          <TabsContent value="saved-tests" className="space-y-6">
            <div className="space-y-4">
              {tests.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-medium">{test.name}</h3>
                          <p className="text-sm text-gray-600">
                            <Badge variant="outline" className="mr-2">
                              {test.method}
                            </Badge>
                            {test.url}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last run: {test.lastRun === "Never" ? "Never" : new Date(test.lastRun).toLocaleString()}
                            {test.responseTime && ` • ${test.responseTime}ms`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(test.status)}>
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => runTest(test)}>
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Test History */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Test Execution History
                </CardTitle>
                <CardDescription>Recent test runs and their results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium">
                            {tests.find((t) => t.id === result.testId)?.name || "Unknown Test"}
                          </p>
                          <p className="text-sm text-gray-600">{new Date(result.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge variant={result.statusCode >= 400 ? "destructive" : "default"}>
                          {result.statusCode}
                        </Badge>
                        <span>{result.responseTime}ms</span>
                        <Button variant="ghost" size="sm">
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Documentation */}
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  API Documentation
                </CardTitle>
                <CardDescription>Complete API reference and examples</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Base URL</h3>
                  <pre className="bg-gray-100 p-3 rounded">https://api.tsmarthub.com/v1</pre>

                  <h3>Authentication</h3>
                  <p>All API requests require authentication using an API key in the Authorization header:</p>
                  <pre className="bg-gray-100 p-3 rounded">Authorization: Bearer YOUR_API_KEY</pre>

                  <h3>Common Endpoints</h3>
                  <div className="space-y-4">
                    <div>
                      <h4>
                        <Badge variant="outline">GET</Badge> /integrations
                      </h4>
                      <p>Retrieve all integrations for your account</p>
                    </div>
                    <div>
                      <h4>
                        <Badge variant="outline">POST</Badge> /integrations
                      </h4>
                      <p>Create a new integration</p>
                    </div>
                    <div>
                      <h4>
                        <Badge variant="outline">GET</Badge> /integrations/&#123;id&#125;
                      </h4>
                      <p>Get details for a specific integration</p>
                    </div>
                    <div>
                      <h4>
                        <Badge variant="outline">PUT</Badge> /integrations/&#123;id&#125;
                      </h4>
                      <p>Update an existing integration</p>
                    </div>
                    <div>
                      <h4>
                        <Badge variant="outline">DELETE</Badge> /integrations/&#123;id&#125;
                      </h4>
                      <p>Delete an integration</p>
                    </div>
                  </div>

                  <h3>Rate Limits</h3>
                  <p>API requests are rate limited based on your subscription plan:</p>
                  <ul>
                    <li>Basic: 1,000 requests/hour</li>
                    <li>Pro: 10,000 requests/hour</li>
                    <li>Enterprise: 100,000 requests/hour</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
