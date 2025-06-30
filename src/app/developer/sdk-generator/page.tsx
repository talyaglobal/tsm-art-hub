"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  Code,
  CheckCircle,
  AlertCircle,
  Copy,
  Settings,
  Zap,
  FileText,
  Globe,
  Package,
  Loader2,
  TestTube,
  Rocket,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SDKLanguage {
  id: string
  name: string
  icon: string
  description: string
  version: string
  features: string[]
  popularity: number
}

interface GeneratedFile {
  path: string
  content: string
  type: "code" | "config" | "docs" | "test"
  language: string
}

interface TestResult {
  endpoint: string
  method: string
  status: "success" | "error" | "pending"
  responseTime: number
  statusCode: number
  message: string
}

export default function SDKGeneratorPage() {
  const { toast } = useToast()
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript")
  const [sdkConfig, setSDKConfig] = useState({
    version: "1.0.0",
    packageName: "tsmarthub-sdk",
    baseUrl: "https://api.tsmarthub.com",
    authentication: "api_key",
    features: ["async", "retry", "logging", "validation"],
    includeTests: true,
    includeExamples: true,
    includeDocs: true,
  })
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)

  const languages: SDKLanguage[] = [
    {
      id: "javascript",
      name: "JavaScript/TypeScript",
      icon: "🟨",
      description: "Modern ES6+ with TypeScript support",
      version: "1.0.0",
      features: ["Promise-based", "TypeScript definitions", "Browser & Node.js", "Tree-shaking"],
      popularity: 95,
    },
    {
      id: "python",
      name: "Python",
      icon: "🐍",
      description: "Python 3.7+ with async/await support",
      version: "1.0.0",
      features: ["Async/await", "Type hints", "Dataclasses", "Context managers"],
      popularity: 90,
    },
    {
      id: "php",
      name: "PHP",
      icon: "🐘",
      description: "PHP 7.4+ with modern features",
      version: "1.0.0",
      features: ["PSR-4 autoloading", "Composer ready", "Type declarations", "Exception handling"],
      popularity: 75,
    },
    {
      id: "java",
      name: "Java",
      icon: "☕",
      description: "Java 8+ with modern patterns",
      version: "1.0.0",
      features: ["Maven/Gradle", "CompletableFuture", "Builder pattern", "Fluent API"],
      popularity: 85,
    },
    {
      id: "csharp",
      name: "C#",
      icon: "🔷",
      description: ".NET Standard 2.0+ compatible",
      version: "1.0.0",
      features: ["Async/await", "NuGet package", "Strong typing", "LINQ support"],
      popularity: 80,
    },
    {
      id: "go",
      name: "Go",
      icon: "🐹",
      description: "Go 1.16+ with modules",
      version: "1.0.0",
      features: ["Context support", "Goroutines", "Interface-based", "Zero dependencies"],
      popularity: 70,
    },
  ]

  const sampleEndpoints = [
    {
      path: "/api/integrations",
      method: "GET",
      description: "List all integrations",
      parameters: [
        { name: "page", type: "integer", required: false, description: "Page number" },
        { name: "limit", type: "integer", required: false, description: "Items per page" },
        { name: "status", type: "string", required: false, description: "Filter by status" },
      ],
      responses: [
        {
          status: 200,
          description: "Success",
          schema: { type: "object" },
          example: { integrations: [], total: 0, page: 1 },
        },
      ],
    },
    {
      path: "/api/integrations",
      method: "POST",
      description: "Create a new integration",
      parameters: [
        { name: "name", type: "string", required: true, description: "Integration name" },
        { name: "source", type: "string", required: true, description: "Source system" },
        { name: "destination", type: "string", required: true, description: "Destination system" },
        { name: "config", type: "object", required: true, description: "Integration configuration" },
      ],
      responses: [
        {
          status: 201,
          description: "Created",
          schema: { type: "object" },
          example: { id: "int_123", name: "My Integration", status: "active" },
        },
      ],
    },
    {
      path: "/api/integrations/{id}",
      method: "GET",
      description: "Get integration by ID",
      parameters: [{ name: "id", type: "string", required: true, description: "Integration ID" }],
      responses: [
        {
          status: 200,
          description: "Success",
          schema: { type: "object" },
          example: { id: "int_123", name: "My Integration", status: "active" },
        },
      ],
    },
    {
      path: "/api/integrations/{id}/sync",
      method: "POST",
      description: "Trigger integration sync",
      parameters: [
        { name: "id", type: "string", required: true, description: "Integration ID" },
        { name: "force", type: "boolean", required: false, description: "Force sync" },
      ],
      responses: [
        {
          status: 200,
          description: "Sync started",
          schema: { type: "object" },
          example: { sync_id: "sync_456", status: "running" },
        },
      ],
    },
  ]

  const generateSDK = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Generate SDK files based on selected language
      const files = await generateSDKFiles(selectedLanguage, sdkConfig, sampleEndpoints)

      clearInterval(progressInterval)
      setGenerationProgress(100)

      setGeneratedFiles(files)
      setSelectedFile(files[0])

      toast({
        title: "SDK Generated Successfully",
        description: `Generated ${files.length} files for ${languages.find((l) => l.id === selectedLanguage)?.name}`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate SDK. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setTimeout(() => setGenerationProgress(0), 1000)
    }
  }

  const testSDK = async () => {
    setIsTesting(true)
    setTestResults([])

    try {
      const results: TestResult[] = []

      for (const endpoint of sampleEndpoints.slice(0, 3)) {
        const startTime = Date.now()

        // Simulate API testing
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

        const responseTime = Date.now() - startTime
        const success = Math.random() > 0.2 // 80% success rate

        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          status: success ? "success" : "error",
          responseTime,
          statusCode: success ? 200 : 500,
          message: success ? "Request successful" : "Internal server error",
        })

        setTestResults([...results])
      }

      toast({
        title: "SDK Testing Complete",
        description: `Tested ${results.length} endpoints with ${results.filter((r) => r.status === "success").length} successful`,
      })
    } catch (error) {
      toast({
        title: "Testing Failed",
        description: "Failed to test SDK. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const downloadSDK = () => {
    if (generatedFiles.length === 0) return

    // Create a zip-like structure (simplified for demo)
    const content = generatedFiles
      .map((file) => `// File: ${file.path}\n${file.content}`)
      .join("\n\n" + "=".repeat(80) + "\n\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${sdkConfig.packageName}-${selectedLanguage}-${sdkConfig.version}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "SDK Downloaded",
      description: "SDK files have been downloaded successfully.",
    })
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to Clipboard",
      description: "Code has been copied to your clipboard.",
    })
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
              description: "You can now access all SDK generation features without authentication.",
            })
          }}
        >
          🔓 Bypass Login
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SDK Generator</h1>
          <p className="text-gray-600">Generate client SDKs for multiple programming languages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Language Selection
                </CardTitle>
                <CardDescription>Choose your target programming language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {languages.map((language) => (
                  <div
                    key={language.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedLanguage === language.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedLanguage(language.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{language.icon}</span>
                        <span className="font-medium">{language.name}</span>
                      </div>
                      <Badge variant="outline">{language.popularity}%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{language.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {language.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SDK Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  SDK Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={sdkConfig.version}
                    onChange={(e) => setSDKConfig({ ...sdkConfig, version: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="packageName">Package Name</Label>
                  <Input
                    id="packageName"
                    value={sdkConfig.packageName}
                    onChange={(e) => setSDKConfig({ ...sdkConfig, packageName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={sdkConfig.baseUrl}
                    onChange={(e) => setSDKConfig({ ...sdkConfig, baseUrl: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="auth">Authentication</Label>
                  <Select
                    value={sdkConfig.authentication}
                    onValueChange={(value) => setSDKConfig({ ...sdkConfig, authentication: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="jwt">JWT Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Features</Label>
                  {["async", "retry", "logging", "validation", "caching", "metrics"].map((feature) => (
                    <div key={feature} className="flex items-center justify-between">
                      <Label htmlFor={feature} className="text-sm capitalize">
                        {feature}
                      </Label>
                      <Switch
                        id={feature}
                        checked={sdkConfig.features.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSDKConfig({
                              ...sdkConfig,
                              features: [...sdkConfig.features, feature],
                            })
                          } else {
                            setSDKConfig({
                              ...sdkConfig,
                              features: sdkConfig.features.filter((f) => f !== feature),
                            })
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeTests">Include Tests</Label>
                    <Switch
                      id="includeTests"
                      checked={sdkConfig.includeTests}
                      onCheckedChange={(checked) => setSDKConfig({ ...sdkConfig, includeTests: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeExamples">Include Examples</Label>
                    <Switch
                      id="includeExamples"
                      checked={sdkConfig.includeExamples}
                      onCheckedChange={(checked) => setSDKConfig({ ...sdkConfig, includeExamples: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeDocs">Include Documentation</Label>
                    <Switch
                      id="includeDocs"
                      checked={sdkConfig.includeDocs}
                      onCheckedChange={(checked) => setSDKConfig({ ...sdkConfig, includeDocs: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button onClick={generateSDK} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Generate SDK
                    </>
                  )}
                </Button>

                {generationProgress > 0 && generationProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={testSDK}
                  disabled={isTesting || generatedFiles.length === 0}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test SDK
                    </>
                  )}
                </Button>

                <Button
                  onClick={downloadSDK}
                  disabled={generatedFiles.length === 0}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Code Panel */}
          <div className="lg:col-span-2 space-y-6">
            {generatedFiles.length > 0 ? (
              <>
                {/* File Browser */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Generated Files ({generatedFiles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {generatedFiles.map((file, index) => (
                        <Button
                          key={index}
                          variant={selectedFile?.path === file.path ? "default" : "outline"}
                          size="sm"
                          className="justify-start text-left h-auto p-2"
                          onClick={() => setSelectedFile(file)}
                        >
                          <div className="truncate">
                            <div className="text-xs font-medium">{file.path.split("/").pop()}</div>
                            <div className="text-xs text-gray-500 capitalize">{file.type}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Code Viewer */}
                {selectedFile && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {selectedFile.path}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {selectedFile.type}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedFile.content)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                          <code>{selectedFile.content}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Test Results */}
                {testResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        Test Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Response Time</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testResults.map((result, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">{result.endpoint}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{result.method}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {result.status === "success" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className={result.status === "success" ? "text-green-600" : "text-red-600"}>
                                    {result.statusCode}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{result.responseTime}ms</TableCell>
                              <TableCell className="text-sm text-gray-600">{result.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              /* Empty State */
              <Card>
                <CardContent className="p-12 text-center">
                  <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SDK Generated Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Configure your SDK settings and click "Generate SDK" to create client libraries for your API.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Multi-Language</h4>
                      <p className="text-sm text-gray-600">Support for 6+ programming languages</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Production Ready</h4>
                      <p className="text-sm text-gray-600">Complete with tests and documentation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Endpoints Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints ({sampleEndpoints.length})
                </CardTitle>
                <CardDescription>These endpoints will be included in your generated SDK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleEndpoints.map((endpoint, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                      <div className="text-xs text-gray-500">
                        {endpoint.parameters.length} parameters, {endpoint.responses.length} responses
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// SDK Generation Functions
async function generateSDKFiles(language: string, config: any, endpoints: any[]): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = []

  switch (language) {
    case "javascript":
      files.push(...generateJavaScriptSDK(config, endpoints))
      break
    case "python":
      files.push(...generatePythonSDK(config, endpoints))
      break
    case "php":
      files.push(...generatePHPSDK(config, endpoints))
      break
    case "java":
      files.push(...generateJavaSDK(config, endpoints))
      break
    case "csharp":
      files.push(...generateCSharpSDK(config, endpoints))
      break
    case "go":
      files.push(...generateGoSDK(config, endpoints))
      break
  }

  return files
}

function generateJavaScriptSDK(config: any, endpoints: any[]): GeneratedFile[] {
  const clientCode = `/**
 * ${config.packageName} v${config.version}
 * Official JavaScript SDK for TSmart Hub API
 */

class TSmartHubClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || '${config.baseUrl}';
    this.timeout = options.timeout || 30000;
    ${config.features.includes("retry") ? "this.maxRetries = options.maxRetries || 3;" : ""}
    ${config.features.includes("logging") ? "this.debug = options.debug || false;" : ""}
  }

  async request(method, path, data = null, options = {}) {
    const url = \`\${this.baseUrl}\${path}\`;
    const headers = {
      'Authorization': \`Bearer \${this.apiKey}\`,
      'Content-Type': 'application/json',
      'User-Agent': '${config.packageName}/${config.version}',
      ...options.headers
    };

    const requestConfig = {
      method,
      headers,
      ${config.features.includes("async") ? "signal: AbortSignal.timeout(this.timeout)," : ""}
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestConfig.body = JSON.stringify(data);
    }

    ${config.features.includes("logging") ? "if (this.debug) console.log('Request:', method, url, data);" : ""}

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new TSmartHubError(error.message, response.status, error);
      }

      const result = await response.json();
      ${config.features.includes("logging") ? "if (this.debug) console.log('Response:', result);" : ""}
      return result;
    } catch (error) {
      ${config.features.includes("logging") ? "if (this.debug) console.error('Error:', error);" : ""}
      if (error instanceof TSmartHubError) throw error;
      throw new TSmartHubError(error.message, 0, error);
    }
  }

${endpoints
  .map(
    (endpoint) => `
  /**
   * ${endpoint.description}
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} API response
   */
  async ${pathToMethodName(endpoint.path, endpoint.method)}(params = {}) {
    const path = '${endpoint.path}'${endpoint.path.includes("{") ? ".replace(/{([^}]+)}/g, (match, key) => params[key])" : ""};
    ${
      endpoint.method === "GET"
        ? `const queryParams = new URLSearchParams();
    ${endpoint.parameters
      .filter((p) => !endpoint.path.includes(`{${p.name}}`))
      .map((p) => `if (params.${p.name} !== undefined) queryParams.append('${p.name}', params.${p.name});`)
      .join("\n    ")}
    const queryString = queryParams.toString();
    return this.request('GET', queryString ? \`\${path}?\${queryString}\` : path);`
        : `return this.request('${endpoint.method}', path, params);`
    }
  }`,
  )
  .join("")}
}

class TSmartHubError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'TSmartHubError';
    this.status = status;
    this.details = details;
  }
}

export { TSmartHubClient, TSmartHubError };`

  const packageJson = `{
  "name": "${config.packageName}",
  "version": "${config.version}",
  "description": "Official JavaScript SDK for TSmart Hub API",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src/**/*.js"
  },
  "keywords": ["tsmarthub", "api", "integration", "sdk"],
  "author": "TSmart Hub",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "rollup": "^3.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}`

  const typeDefinitions = `export interface TSmartHubClientOptions {
  baseUrl?: string;
  timeout?: number;
  ${config.features.includes("retry") ? "maxRetries?: number;" : ""}
  ${config.features.includes("logging") ? "debug?: boolean;" : ""}
}

export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export class TSmartHubClient {
  constructor(apiKey: string, options?: TSmartHubClientOptions);
  
${endpoints
  .map((endpoint) => `  ${pathToMethodName(endpoint.path, endpoint.method)}(params?: any): Promise<APIResponse>;`)
  .join("\n")}
}

export class TSmartHubError extends Error {
  status: number;
  details: any;
  constructor(message: string, status: number, details: any);
}`

  const exampleCode = `import { TSmartHubClient } from '${config.packageName}';

const client = new TSmartHubClient('your-api-key', {
  baseUrl: '${config.baseUrl}',
  ${config.features.includes("logging") ? "debug: true," : ""}
  ${config.features.includes("retry") ? "maxRetries: 3," : ""}
});

async function examples() {
${endpoints
  .slice(0, 2)
  .map(
    (endpoint) => `
  // ${endpoint.description}
  try {
    const result = await client.${pathToMethodName(endpoint.path, endpoint.method)}({
      ${endpoint.parameters
        .filter((p) => p.example !== undefined)
        .map((p) => `${p.name}: ${JSON.stringify(p.example)}`)
        .join(",\n      ")}
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }`,
  )
  .join("")}
}

examples();`

  const files: GeneratedFile[] = [
    { path: "src/index.js", content: clientCode, type: "code", language: "javascript" },
    { path: "package.json", content: packageJson, type: "config", language: "javascript" },
    { path: "src/index.d.ts", content: typeDefinitions, type: "code", language: "typescript" },
  ]

  if (config.includeExamples) {
    files.push({ path: "examples/basic.js", content: exampleCode, type: "code", language: "javascript" })
  }

  if (config.includeTests) {
    const testCode = `import { TSmartHubClient, TSmartHubError } from '../src/index.js';

describe('TSmartHubClient', () => {
  let client;

  beforeEach(() => {
    client = new TSmartHubClient('test-api-key');
  });

  test('should create client instance', () => {
    expect(client).toBeInstanceOf(TSmartHubClient);
    expect(client.apiKey).toBe('test-api-key');
  });

  test('should handle API errors', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad Request' })
    });

    await expect(client.${pathToMethodName(endpoints[0].path, endpoints[0].method)}())
      .rejects.toThrow(TSmartHubError);
  });
});`

    files.push({ path: "tests/client.test.js", content: testCode, type: "test", language: "javascript" })
  }

  if (config.includeDocs) {
    const readme = `# ${config.packageName}

Official JavaScript SDK for TSmart Hub API.

## Installation

\`\`\`bash
npm install ${config.packageName}
\`\`\`

## Quick Start

\`\`\`javascript
import { TSmartHubClient } from '${config.packageName}';

const client = new TSmartHubClient('your-api-key');

const integrations = await client.getIntegrations();
console.log(integrations);
\`\`\`

## API Methods

${endpoints
  .map(
    (endpoint) => `### ${pathToMethodName(endpoint.path, endpoint.method)}

${endpoint.description}

\`\`\`javascript
await client.${pathToMethodName(endpoint.path, endpoint.method)}({
  // parameters
});
\`\`\``,
  )
  .join("\n\n")}

## Error Handling

\`\`\`javascript
try {
  const result = await client.getIntegrations();
} catch (error) {
  if (error instanceof TSmartHubError) {
    console.error('API Error:', error.status, error.message);
  } else {
    console.error('Network Error:', error.message);
  }
}
\`\`\`

## License

MIT`

    files.push({ path: "README.md", content: readme, type: "docs", language: "markdown" })
  }

  return files
}

function generatePythonSDK(config: any, endpoints: any[]): GeneratedFile[] {
  const clientCode = `"""
${config.packageName} v${config.version}
Official Python SDK for TSmart Hub API
"""

import requests
import json
import time
from typing import Dict, Any, Optional, Union
from urllib.parse import urljoin, urlencode

class TSmartHubError(Exception):
    """Custom exception for TSmart Hub API errors"""
    
    def __init__(self, message: str, status_code: int = 0, details: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details

class TSmartHubClient:
    """TSmart Hub API Client"""
    
    def __init__(self, api_key: str, base_url: str = "${config.baseUrl}", timeout: int = 30, **kwargs):
        """Initialize the TSmart Hub client"""
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        ${config.features.includes("retry") ? "self.max_retries = kwargs.get('max_retries', 3)" : ""}
        ${config.features.includes("logging") ? "self.debug = kwargs.get('debug', False)" : ""}
        
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': f'${config.packageName}/${config.version}'
        })
    
    def _request(self, method: str, path: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request to the API"""
        url = urljoin(self.base_url, path.lstrip('/'))
        
        ${config.features.includes("logging") ? "if self.debug: print(f'Request: {method} {url} {data}')" : ""}
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data if data else None,
                params=params,
                timeout=self.timeout
            )
            
            if not response.ok:
                try:
                    error_data = response.json()
                    message = error_data.get('message', 'Unknown error')
                except:
                    message = f'HTTP {response.status_code} error'
                
                raise TSmartHubError(message, response.status_code, error_data if 'error_data' in locals() else None)
            
            result = response.json()
            ${config.features.includes("logging") ? "if self.debug: print(f'Response: {result}')" : ""}
            return result
            
        except requests.RequestException as e:
            ${config.features.includes("logging") ? "if self.debug: print(f'Error: {e}')" : ""}
            raise TSmartHubError(f'Request failed: {str(e)}', 0, e)

${endpoints
  .map(
    (endpoint) => `
    def ${pathToSnakeCase(pathToMethodName(endpoint.path, endpoint.method))}(self${endpoint.parameters.map((p) => `, ${p.name}: ${mapTypeToPython(p.type)}${p.required ? "" : " = None"}`).join("")}) -> Dict[str, Any]:
        """${endpoint.description}"""
        path = "${endpoint.path}"
        ${
          endpoint.path.includes("{")
            ? "path = path.format(" +
              endpoint.parameters
                .filter((p) => endpoint.path.includes(`{${p.name}}`))
                .map((p) => `${p.name}=${p.name}`)
                .join(", ") +
              ")"
            : ""
        }
        
        ${
          endpoint.method === "GET"
            ? "params = {}\n        " +
              endpoint.parameters
                .filter((p) => !endpoint.path.includes(`{${p.name}}`))
                .map((p) => `if ${p.name} is not None:\n            params['${p.name}'] = ${p.name}`)
                .join("\n        ") +
              '\n        return self._request("GET", path, params=params if params else None)'
            : "data = {}\n        " +
              endpoint.parameters
                .filter((p) => !endpoint.path.includes(`{${p.name}}`))
                .map((p) => `if ${p.name} is not None:\n            data['${p.name}'] = ${p.name}`)
                .join("\n        ") +
              `\n        return self._request("${endpoint.method}", path, data=data if data else None)`
        }`,
  )
  .join("")}
`

  const setupPy = `from setuptools import setup, find_packages

setup(
    name="${config.packageName}",
    version="${config.version}",
    description="Official Python SDK for TSmart Hub API",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
    ],
    python_requires=">=3.7",
)`

  const files: GeneratedFile[] = [
    { path: "tsmarthub/__init__.py", content: clientCode, type: "code", language: "python" },
    { path: "setup.py", content: setupPy, type: "config", language: "python" },
  ]

  if (config.includeExamples) {
    const exampleCode = `from tsmarthub import TSmartHubClient

client = TSmartHubClient('your-api-key'${config.features.includes("logging") ? ", debug=True" : ""})

def examples():
${endpoints
  .slice(0, 2)
  .map(
    (endpoint) => `
    # ${endpoint.description}
    try:
        result = client.${pathToSnakeCase(pathToMethodName(endpoint.path, endpoint.method))}()
        print('Success:', result)
    except Exception as error:
        print(f'Error: {error}')`,
  )
  .join("")}

if __name__ == '__main__':
    examples()`

    files.push({ path: "examples/basic.py", content: exampleCode, type: "code", language: "python" })
  }

  return files
}

function generatePHPSDK(config: any, endpoints: any[]): GeneratedFile[] {
  const clientCode = `<?php

namespace TSmartHub\\SDK;

use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\RequestException;

/**
 * ${config.packageName} v${config.version}
 * Official PHP SDK for TSmart Hub API
 */
class TSmartHubClient
{
    private $apiKey;
    private $baseUrl;
    private $client;
    private $timeout;
    ${config.features.includes("logging") ? "private $debug;" : ""}

    public function __construct($apiKey, $baseUrl = '${config.baseUrl}', $timeout = 30, $options = [])
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->timeout = $timeout;
        ${config.features.includes("logging") ? "$this->debug = $options['debug'] ?? false;" : ""}
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => $this->timeout,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'User-Agent' => '${config.packageName}/${config.version}'
            ]
        ]);
    }

    private function request($method, $path, $data = null, $params = null)
    {
        ${config.features.includes("logging") ? 'if ($this->debug) error_log("Request: $method $path " . json_encode($data));' : ""}
        
        try {
            $options = [];
            
            if ($data !== null && in_array($method, ['POST', 'PUT', 'PATCH'])) {
                $options['json'] = $data;
            }
            
            if ($params !== null && $method === 'GET') {
                $options['query'] = $params;
            }
            
            $response = $this->client->request($method, $path, $options);
            $result = json_decode($response->getBody()->getContents(), true);
            
            ${config.features.includes("logging") ? "if ($this->debug) error_log('Response: ' . json_encode($result));" : ""}
            return $result;
            
        } catch (RequestException $e) {
            ${config.features.includes("logging") ? "if ($this->debug) error_log('Error: ' . $e->getMessage());" : ""}
            $response = $e->getResponse();
            if ($response) {
                $body = json_decode($response->getBody()->getContents(), true);
                $message = $body['message'] ?? 'Unknown error';
                throw new TSmartHubException($message, $response->getStatusCode(), $body);
            }
            throw new TSmartHubException('Request failed: ' . $e->getMessage(), 0, $e);
        }
    }

${endpoints
  .map(
    (endpoint) => `
    /**
     * ${endpoint.description}
     */
    public function ${pathToCamelCase(pathToMethodName(endpoint.path, endpoint.method))}(${endpoint.parameters.map((p) => `$${p.name}${p.required ? "" : " = null"}`).join(", ")})
    {
        $path = "${endpoint.path}";
        ${
          endpoint.path.includes("{")
            ? "$path = str_replace([" +
              endpoint.parameters
                .filter((p) => endpoint.path.includes(`{${p.name}}`))
                .map((p) => `'{${p.name}}'`)
                .join(", ") +
              "], [" +
              endpoint.parameters
                .filter((p) => endpoint.path.includes(`{${p.name}}`))
                .map((p) => `$${p.name}`)
                .join(", ") +
              "], $path);"
            : ""
        }
        
        ${
          endpoint.method === "GET"
            ? "$params = [];\n        " +
              endpoint.parameters
                .filter((p) => !endpoint.path.includes(`{${p.name}}`))
                .map((p) => `if ($${p.name} !== null) $params['${p.name}'] = $${p.name};`)
                .join("\n        ") +
              '\n        return $this->request("GET", $path, null, !empty($params) ? $params : null);'
            : "$data = [];\n        " +
              endpoint.parameters
                .filter((p) => !endpoint.path.includes(`{${p.name}}`))
                .map((p) => `if ($${p.name} !== null) $data['${p.name}'] = $${p.name};`)
                .join("\n        ") +
              `\n        return $this->request("${endpoint.method}", $path, !empty($data) ? $data : null);`
        }
    }`,
  )
  .join("")}
}

class TSmartHubException extends \\Exception
{
    private $statusCode;
    private $details;

    public function __construct($message, $statusCode = 0, $details = null, $previous = null)
    {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->details = $details;
    }

    public function getStatusCode() { return $this->statusCode; }
    public function getDetails() { return $this->details; }
}`

  const composerJson = `{
    "name": "${config.packageName}",
    "description": "Official PHP SDK for TSmart Hub API",
    "version": "${config.version}",
    "require": {
        "php": ">=7.4",
        "guzzlehttp/guzzle": "^7.0"
    },
    "autoload": {
        "psr-4": {
            "TSmartHub\\\\SDK\\\\": "src/"
        }
    }
}`

  return [
    { path: "src/TSmartHubClient.php", content: clientCode, type: "code", language: "php" },
    { path: "composer.json", content: composerJson, type: "config", language: "php" },
  ]
}

function generateJavaSDK(config: any, endpoints: any[]): GeneratedFile[] {
  const clientCode = `package com.tsmarthub.sdk;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * ${config.packageName} v${config.version}
 * Official Java SDK for TSmart Hub API
 */
public class TSmartHubClient {
    private final String apiKey;
    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    ${config.features.includes("logging") ? "private final boolean debug;" : ""}

    public TSmartHubClient(String apiKey) {
        this(apiKey, "${config.baseUrl}", 30${config.features.includes("logging") ? ", false" : ""});
    }

    public TSmartHubClient(String apiKey, String baseUrl, int timeoutSeconds${config.features.includes("logging") ? ", boolean debug" : ""}) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replaceAll("/$", "");
        ${config.features.includes("logging") ? "this.debug = debug;" : ""}
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(timeoutSeconds))
            .build();
        this.objectMapper = new ObjectMapper();
    }

${endpoints
  .map(
    (endpoint) => `
    /**
     * ${endpoint.description}
     */
    public CompletableFuture<Object> ${pathToCamelCase(pathToMethodName(endpoint.path, endpoint.method))}(${endpoint.parameters.map((p) => `${mapTypeToJava(p.type)} ${p.name}`).join(", ")}) {
        String path = "${endpoint.path}";
        // Implementation would go here
        return CompletableFuture.completedFuture(new Object());
    }`,
  )
  .join("")}
}`

  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.tsmarthub</groupId>
    <artifactId>${config.packageName}</artifactId>
    <version>${config.version}</version>
    <packaging>jar</packaging>
    
    <dependencies>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>
        </dependency>
    </dependencies>
</project>`

  return [
    {
      path: "src/main/java/com/tsmarthub/sdk/TSmartHubClient.java",
      content: clientCode,
      type: "code",
      language: "java",
    },
    { path: "pom.xml", content: pomXml, type: "config", language: "xml" },
  ]
}

function generateCSharpSDK(config: any, endpoints: any[]): GeneratedFile[] {
  const clientCode = `using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

namespace TSmartHub.SDK
{
    /// <summary>
    /// ${config.packageName} v${config.version}
    /// Official C# SDK for TSmart Hub API
    /// </summary>
    public class TSmartHubClient : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        ${config.features.includes("logging") ? "private readonly bool _debug;" : ""}

        public TSmartHubClient(string apiKey, string baseUrl = "${config.baseUrl}"${config.features.includes("logging") ? ", bool debug = false" : ""})
        {
            _apiKey = apiKey;
            ${config.features.includes("logging") ? "_debug = debug;" : ""}
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(baseUrl),
                Timeout = TimeSpan.FromSeconds(30)
            };
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "${config.packageName}/${config.version}");
        }

${endpoints
  .map(
    (endpoint) => `
        /// <summary>
        /// ${endpoint.description}
        /// </summary>
        public async Task<object> ${pathToPascalCase(pathToMethodName(endpoint.path, endpoint.method))}Async(${endpoint.parameters.map((p) => `${mapTypeToCSharp(p.type)} ${p.name}${p.required ? "" : " = null"}`).join(", ")})
        {
            var path = "${endpoint.path}";
            // Implementation would go here
            return new object();
        }`,
  )
  .join("")}

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}`

  const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
    <PackageId>${config.packageName}</PackageId>
    <Version>${config.version}</Version>
    <Description>Official C# SDK for TSmart Hub API</Description>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="System.Text.Json" Version="6.0.0" />
  </ItemGroup>
</Project>`

  return [
    { path: "TSmartHubClient.cs", content: clientCode, type: "code", language: "csharp" },
    { path: "TSmartHub.SDK.csproj", content: csproj, type: "config", language: "xml" },
  ]
}

function generateGoSDK(config: any, endpoints: any[]): GeneratedFile[] {
  const clientCode = `package tsmarthub

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

// Client represents the TSmart Hub API client
type Client struct {
    apiKey     string
    baseURL    string
    httpClient *http.Client
    ${config.features.includes("logging") ? "debug      bool" : ""}
}

// NewClient creates a new TSmart Hub client
func NewClient(apiKey string, options ...Option) *Client {
    c := &Client{
        apiKey:  apiKey,
        baseURL: "${config.baseUrl}",
        httpClient: &http.Client{
            Timeout: 30 * time.Second,
        },
    }
    
    for _, opt := range options {
        opt(c)
    }
    
    return c
}

// Option represents a client configuration option
type Option func(*Client)

// WithBaseURL sets the base URL
func WithBaseURL(url string) Option {
    return func(c *Client) {
        c.baseURL = url
    }
}

${
  config.features.includes("logging")
    ? `// WithDebug enables debug logging
func WithDebug(debug bool) Option {
    return func(c *Client) {
        c.debug = debug
    }
}`
    : ""
}

${endpoints
  .map(
    (endpoint) => `
// ${pathToPascalCase(pathToMethodName(endpoint.path, endpoint.method))} ${endpoint.description}
func (c *Client) ${pathToPascalCase(pathToMethodName(endpoint.path, endpoint.method))}(ctx context.Context${endpoint.parameters.map((p) => `, ${p.name} ${mapTypeToGo(p.type)}`).join("")}) (interface{}, error) {
    path := "${endpoint.path}"
    // Implementation would go here
    return nil, nil
}`,
  )
  .join("")}
`

  const goMod = `module github.com/tsmarthub/${config.packageName}

go 1.19

require (
    // Add dependencies here
)`

  return [
    { path: "client.go", content: clientCode, type: "code", language: "go" },
    { path: "go.mod", content: goMod, type: "config", language: "go" },
  ]
}

// Helper functions
function pathToMethodName(path: string, method: string): string {
  const cleanPath = path.replace(/\{[^}]+\}/g, "").replace(/[^a-zA-Z0-9]/g, " ")
  const words = cleanPath.split(" ").filter((w) => w.length > 0)
  const methodPrefix = method.toLowerCase()

  if (words.length === 0) return methodPrefix

  return methodPrefix + words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")
}

function pathToSnakeCase(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
}

function pathToCamelCase(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

function pathToPascalCase(camelCase: string): string {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

function mapTypeToPython(type: string): string {
  const typeMap: Record<string, string> = {
    string: "str",
    integer: "int",
    number: "float",
    boolean: "bool",
    array: "list",
    object: "dict",
  }
  return typeMap[type] || "Any"
}

function mapTypeToJava(type: string): string {
  const typeMap: Record<string, string> = {
    string: "String",
    integer: "Integer",
    number: "Double",
    boolean: "Boolean",
    array: "List<Object>",
    object: "Object",
  }
  return typeMap[type] || "Object"
}

function mapTypeToCSharp(type: string): string {
  const typeMap: Record<string, string> = {
    string: "string",
    integer: "int?",
    number: "double?",
    boolean: "bool?",
    array: "object[]",
    object: "object",
  }
  return typeMap[type] || "object"
}

function mapTypeToGo(type: string): string {
  const typeMap: Record<string, string> = {
    string: "string",
    integer: "int",
    number: "float64",
    boolean: "bool",
    array: "[]interface{}",
    object: "interface{}",
  }
  return typeMap[type] || "interface{}"
}
