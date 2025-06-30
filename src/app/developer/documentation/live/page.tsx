"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  ExternalLink,
  Copy,
  Play,
  Settings,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Code,
  FileText,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LiveDocConfig {
  apiId: string
  theme: "light" | "dark" | "auto"
  showTesting: boolean
  showExamples: boolean
  customDomain?: string
}

interface TestResult {
  success: boolean
  status: number
  responseTime: number
  data?: any
  error?: string
  timestamp: string
}

export default function LiveDocumentationPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState<LiveDocConfig>({
    apiId: "default",
    theme: "light",
    showTesting: true,
    showExamples: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [documentationUrl, setDocumentationUrl] = useState<string>("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingAPI, setIsTestingAPI] = useState(false)

  const generateLiveDocumentation = async () => {
    setIsGenerating(true)
    try {
      // Simulate documentation generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const baseUrl = window.location.origin
      const docUrl = `${baseUrl}/api/developer/documentation/live?apiId=${config.apiId}&theme=${config.theme}`
      setDocumentationUrl(docUrl)

      toast({
        title: "Live Documentation Generated",
        description: "Your interactive documentation is ready with live API testing.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate live documentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const testLiveAPI = async () => {
    setIsTestingAPI(true)
    try {
      const response = await fetch("/api/developer/documentation/test-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/integrations",
          method: "GET",
          headers: {
            Authorization: "Bearer demo-token",
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        const testResult: TestResult = {
          success: result.data.success,
          status: result.data.response.status,
          responseTime: result.data.timing.duration,
          data: result.data.response.data,
          error: result.data.response.error,
          timestamp: new Date().toISOString(),
        }

        setTestResults([testResult, ...testResults.slice(0, 4)]) // Keep last 5 results

        toast({
          title: "API Test Completed",
          description: `${result.data.success ? "Success" : "Failed"} - ${result.data.response.status} (${result.data.timing.duration.toFixed(0)}ms)`,
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test API endpoint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingAPI(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Documentation URL has been copied.",
    })
  }

  const openDocumentation = () => {
    if (documentationUrl) {
      window.open(documentationUrl, "_blank")
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
              description: "You can now access all live documentation features without authentication.",
            })
          }}
        >
          🔓 Bypass Login
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live API Documentation</h1>
          <p className="text-gray-600">Generate interactive HTML documentation with live API testing capabilities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>Configure your live documentation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="apiId">API Collection</Label>
                  <Select value={config.apiId} onValueChange={(value) => setConfig({ ...config, apiId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">All APIs</SelectItem>
                      <SelectItem value="integrations">Integrations API</SelectItem>
                      <SelectItem value="webhooks">Webhooks API</SelectItem>
                      <SelectItem value="analytics">Analytics API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={config.theme} onValueChange={(value: any) => setConfig({ ...config, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <Input
                    id="customDomain"
                    placeholder="docs.yourcompany.com"
                    value={config.customDomain || ""}
                    onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Features</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showTesting" className="text-sm">
                        Live API Testing
                      </Label>
                      <input
                        type="checkbox"
                        id="showTesting"
                        checked={config.showTesting}
                        onChange={(e) => setConfig({ ...config, showTesting: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showExamples" className="text-sm">
                        Code Examples
                      </Label>
                      <input
                        type="checkbox"
                        id="showExamples"
                        checked={config.showExamples}
                        onChange={(e) => setConfig({ ...config, showExamples: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button onClick={generateLiveDocumentation} disabled={isGenerating} className="w-full mb-3">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Generate Live Documentation
                    </>
                  )}
                </Button>

                {documentationUrl && (
                  <div className="space-y-2">
                    <Button variant="outline" onClick={openDocumentation} className="w-full bg-transparent">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Documentation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={testLiveAPI}
                      disabled={isTestingAPI}
                      className="w-full bg-transparent"
                    >
                      {isTestingAPI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test Live API
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">Status {result.status}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {result.responseTime.toFixed(0)}ms
                            </div>
                          </div>
                        </div>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            {documentationUrl ? (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Live Preview</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="embed">Embed & Share</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Live Documentation Preview
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Live
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(documentationUrl)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={openDocumentation}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={documentationUrl}
                          className="w-full h-96"
                          title="Live API Documentation"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">Documentation URL:</div>
                        <div className="font-mono text-sm bg-white p-2 rounded border break-all">
                          {documentationUrl}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Documentation Features
                      </CardTitle>
                      <CardDescription>Your live documentation includes these powerful features</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Play className="h-6 w-6 text-green-500" />
                            <h4 className="font-medium">Live API Testing</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Test endpoints directly from documentation with real API calls and response validation.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Globe className="h-6 w-6 text-blue-500" />
                            <h4 className="font-medium">Bypass Authentication</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Built-in bypass authentication for easy testing without complex auth setup.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Code className="h-6 w-6 text-purple-500" />
                            <h4 className="font-medium">Multi-Language Examples</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Code examples in JavaScript, Python, PHP, cURL, and more programming languages.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Eye className="h-6 w-6 text-orange-500" />
                            <h4 className="font-medium">Interactive Interface</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Beautiful, responsive interface with syntax highlighting and copy-to-clipboard.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-6 w-6 text-yellow-500" />
                            <h4 className="font-medium">Real-Time Results</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            See actual API responses, status codes, and performance metrics in real-time.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-6 w-6 text-indigo-500" />
                            <h4 className="font-medium">Auto-Generated</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Documentation automatically generated from your API definitions and kept in sync.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="embed" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Embed & Share
                      </CardTitle>
                      <CardDescription>Share your documentation or embed it in your website</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="shareUrl">Direct Link</Label>
                        <div className="flex gap-2 mt-1">
                          <Input id="shareUrl" value={documentationUrl} readOnly className="font-mono text-sm" />
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(documentationUrl)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="embedCode">Embed Code</Label>
                        <div className="mt-1">
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <pre>{`<iframe 
  src="${documentationUrl}"
  width="100%" 
  height="600"
  frameborder="0"
  title="API Documentation">
</iframe>`}</pre>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 bg-transparent"
                            onClick={() =>
                              copyToClipboard(
                                `<iframe src="${documentationUrl}" width="100%" height="600" frameborder="0" title="API Documentation"></iframe>`,
                              )
                            }
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Embed Code
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Custom Domain Setup</Label>
                        <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Host on Your Domain</h4>
                          <p className="text-sm text-blue-800 mb-3">
                            Host your documentation on your own domain for a seamless brand experience.
                          </p>
                          <div className="space-y-2 text-sm text-blue-700">
                            <div>
                              1. Add a CNAME record:{" "}
                              <code className="bg-blue-100 px-1 rounded">
                                docs.yourcompany.com → tsmarthub-docs.vercel.app
                              </code>
                            </div>
                            <div>2. Configure SSL certificate (automatic)</div>
                            <div>3. Update your documentation settings</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={openDocumentation}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Full Documentation
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download HTML
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              /* Empty State */
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Live Documentation</h3>
                  <p className="text-gray-600 mb-6">
                    Create interactive HTML documentation with live API testing capabilities and bypass authentication.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Play className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Live Testing</h4>
                      <p className="text-sm text-gray-600">Test APIs directly from documentation</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Bypass Auth</h4>
                      <p className="text-sm text-gray-600">No authentication setup required</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Code className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Code Examples</h4>
                      <p className="text-sm text-gray-600">Multi-language code snippets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
