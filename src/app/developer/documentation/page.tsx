"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Download,
  Eye,
  Settings,
  Palette,
  Code,
  Globe,
  Search,
  BookOpen,
  Zap,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface APIDefinition {
  id: string
  name: string
  version: string
  description: string
  endpoints: number
  status: "active" | "draft" | "deprecated"
  lastUpdated: string
}

interface DocumentationConfig {
  format: "openapi" | "markdown" | "html"
  theme: "default" | "dark" | "minimal" | "corporate"
  includeExamples: boolean
  includeSchemas: boolean
  includeAuthentication: boolean
  customLogo?: string
  customColors?: {
    primary: string
    secondary: string
    accent: string
  }
  customCSS?: string
}

interface GeneratedDoc {
  id: string
  format: string
  content: string
  url?: string
  size: number
  createdAt: string
}

export default function DocumentationGeneratorPage() {
  const { toast } = useToast()
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([])
  const [config, setConfig] = useState<DocumentationConfig>({
    format: "openapi",
    theme: "default",
    includeExamples: true,
    includeSchemas: true,
    includeAuthentication: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  const sampleAPIs: APIDefinition[] = [
    {
      id: "api_1",
      name: "User Management API",
      version: "v2.1",
      description: "Complete user lifecycle management with authentication and authorization",
      endpoints: 24,
      status: "active",
      lastUpdated: "2024-01-15",
    },
    {
      id: "api_2",
      name: "Integration Hub API",
      version: "v1.8",
      description: "Connect and manage third-party integrations and data flows",
      endpoints: 18,
      status: "active",
      lastUpdated: "2024-01-12",
    },
    {
      id: "api_3",
      name: "Analytics API",
      version: "v3.0",
      description: "Real-time analytics and reporting with advanced filtering",
      endpoints: 32,
      status: "active",
      lastUpdated: "2024-01-10",
    },
    {
      id: "api_4",
      name: "Webhook API",
      version: "v1.2",
      description: "Event-driven webhooks for real-time notifications",
      endpoints: 8,
      status: "draft",
      lastUpdated: "2024-01-08",
    },
    {
      id: "api_5",
      name: "Legacy Orders API",
      version: "v1.0",
      description: "Legacy order management system (deprecated)",
      endpoints: 15,
      status: "deprecated",
      lastUpdated: "2023-12-20",
    },
  ]

  const themes = [
    { id: "default", name: "Default", description: "Clean and professional" },
    { id: "dark", name: "Dark Mode", description: "Dark theme for better readability" },
    { id: "minimal", name: "Minimal", description: "Simple and focused design" },
    { id: "corporate", name: "Corporate", description: "Enterprise-ready styling" },
  ]

  const filteredAPIs = sampleAPIs.filter(
    (api) =>
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const generateDocumentation = async () => {
    if (selectedAPIs.length === 0) {
      toast({
        title: "No APIs Selected",
        description: "Please select at least one API to generate documentation.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simulate documentation generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newDoc: GeneratedDoc = {
        id: `doc_${Date.now()}`,
        format: config.format,
        content: generateSampleDocumentation(config.format),
        url: `https://docs.tsmarthub.com/generated/${Date.now()}`,
        size: Math.floor(Math.random() * 500) + 100, // KB
        createdAt: new Date().toISOString(),
      }

      setGeneratedDocs([newDoc, ...generatedDocs])
      setPreviewContent(newDoc.content)

      toast({
        title: "Documentation Generated",
        description: `Successfully generated ${config.format.toUpperCase()} documentation for ${selectedAPIs.length} APIs.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate documentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadDocumentation = (doc: GeneratedDoc) => {
    const blob = new Blob([doc.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `api-documentation-${doc.format}.${getFileExtension(doc.format)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download Started",
      description: "Documentation file is being downloaded.",
    })
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to Clipboard",
      description: "Documentation content has been copied.",
    })
  }

  const getFileExtension = (format: string) => {
    switch (format) {
      case "openapi":
        return "yaml"
      case "markdown":
        return "md"
      case "html":
        return "html"
      default:
        return "txt"
    }
  }

  const generateSampleDocumentation = (format: string) => {
    switch (format) {
      case "openapi":
        return `openapi: 3.0.3
info:
  title: TSmart Hub API Documentation
  description: Comprehensive API documentation for TSmart Hub services
  version: 1.0.0
  contact:
    name: TSmart Hub Support
    url: https://tsmarthub.com/support
    email: support@tsmarthub.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.tsmarthub.com/v1
    description: Production server
  - url: https://staging-api.tsmarthub.com/v1
    description: Staging server

security:
  - bearerAuth: []

paths:
  /integrations:
    get:
      summary: List all integrations
      description: Retrieve a paginated list of all integrations
      tags:
        - Integrations
      parameters:
        - name: page
          in: query
          description: Page number
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Number of items per page
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  integrations:
                    type: array
                    items:
                      $ref: '#/components/schemas/Integration'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Integration:
      type: object
      required:
        - id
        - name
        - status
      properties:
        id:
          type: string
          description: Unique integration identifier
          example: "int_1234567890"
        name:
          type: string
          description: Integration name
          example: "Shopify to Salesforce Sync"
        status:
          type: string
          enum: [active, inactive, error]
          description: Current integration status
        created_at:
          type: string
          format: date-time
          description: Integration creation timestamp

    Pagination:
      type: object
      properties:
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 20
        total:
          type: integer
          example: 150
        has_more:
          type: boolean
          example: true

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Unauthorized"
              message:
                type: string
                example: "Valid authentication token required"

    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Internal Server Error"
              message:
                type: string
                example: "An unexpected error occurred"`

      case "markdown":
        return `# TSmart Hub API Documentation

Welcome to the TSmart Hub API documentation. This comprehensive guide will help you integrate with our platform and build powerful applications.

## Getting Started

### Authentication

All API requests require authentication using a Bearer token:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.tsmarthub.com/v1/integrations
\`\`\`

### Base URL

All API requests should be made to:
\`\`\`
https://api.tsmarthub.com/v1
\`\`\`

## Integrations API

### List Integrations

Retrieve a paginated list of all integrations.

**Endpoint:** \`GET /integrations\`

**Parameters:**
- \`page\` (optional): Page number (default: 1)
- \`limit\` (optional): Items per page (default: 20, max: 100)
- \`status\` (optional): Filter by status (active, inactive, error)

**Example Request:**
\`\`\`bash
curl -X GET "https://api.tsmarthub.com/v1/integrations?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

**Example Response:**
\`\`\`json
{
  "integrations": [
    {
      "id": "int_1234567890",
      "name": "Shopify to Salesforce Sync",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "has_more": true
  }
}
\`\`\`

### Create Integration

Create a new integration between two systems.

**Endpoint:** \`POST /integrations\`

**Request Body:**
\`\`\`json
{
  "name": "My Integration",
  "source": "shopify",
  "destination": "salesforce",
  "config": {
    "sync_frequency": "hourly",
    "field_mappings": {
      "customer_email": "email",
      "customer_name": "full_name"
    }
  }
}
\`\`\`

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure:

- \`200\` - OK: Request successful
- \`201\` - Created: Resource created successfully
- \`400\` - Bad Request: Invalid request parameters
- \`401\` - Unauthorized: Authentication required
- \`404\` - Not Found: Resource not found
- \`500\` - Internal Server Error: Server error

**Error Response Format:**
\`\`\`json
{
  "error": "validation_error",
  "message": "The request parameters are invalid",
  "details": {
    "field": "name",
    "issue": "required"
  }
}
\`\`\`

## Rate Limiting

API requests are limited to 1000 requests per hour per API key. Rate limit information is included in response headers:

- \`X-RateLimit-Limit\`: Request limit per hour
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Time when rate limit resets (Unix timestamp)

## SDKs and Libraries

Official SDKs are available for popular programming languages:

- [JavaScript/TypeScript SDK](https://github.com/tsmarthub/sdk-js)
- [Python SDK](https://github.com/tsmarthub/sdk-python)
- [PHP SDK](https://github.com/tsmarthub/sdk-php)
- [Java SDK](https://github.com/tsmarthub/sdk-java)

## Support

Need help? Contact our support team:
- Email: support@tsmarthub.com
- Documentation: https://docs.tsmarthub.com
- Status Page: https://status.tsmarthub.com`

      case "html":
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSmart Hub API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .endpoint {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.8em;
            margin-right: 10px;
        }
        .get { background: #28a745; color: white; }
        .post { background: #007bff; color: white; }
        .put { background: #ffc107; color: black; }
        .delete { background: #dc3545; color: white; }
        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .nav {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .nav a {
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
        }
        .nav a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>TSmart Hub API</h1>
        <p>Comprehensive API documentation for integration and automation</p>
    </div>

    <div class="nav">
        <ul>
            <li><a href="#getting-started">Getting Started</a></li>
            <li><a href="#authentication">Authentication</a></li>
            <li><a href="#integrations">Integrations</a></li>
            <li><a href="#webhooks">Webhooks</a></li>
            <li><a href="#errors">Error Handling</a></li>
            <li><a href="#sdks">SDKs</a></li>
        </ul>
    </div>

    <div class="section" id="getting-started">
        <h2>Getting Started</h2>
        <p>Welcome to the TSmart Hub API! Our RESTful API allows you to integrate with our platform and build powerful automation workflows.</p>
        
        <h3>Base URL</h3>
        <pre><code>https://api.tsmarthub.com/v1</code></pre>
        
        <h3>Content Type</h3>
        <p>All requests should include the <code>Content-Type: application/json</code> header.</p>
    </div>

    <div class="section" id="authentication">
        <h2>Authentication</h2>
        <p>All API requests require authentication using a Bearer token in the Authorization header:</p>
        
        <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
        
        <p>You can obtain your API key from the TSmart Hub dashboard under Settings → API Keys.</p>
    </div>

    <div class="section" id="integrations">
        <h2>Integrations API</h2>
        
        <div class="endpoint">
            <h3><span class="method get">GET</span> /integrations</h3>
            <p>Retrieve a paginated list of all integrations.</p>
            
            <h4>Parameters</h4>
            <ul>
                <li><code>page</code> (optional): Page number (default: 1)</li>
                <li><code>limit</code> (optional): Items per page (default: 20, max: 100)</li>
                <li><code>status</code> (optional): Filter by status</li>
            </ul>
            
            <h4>Example Request</h4>
            <pre><code>curl -X GET "https://api.tsmarthub.com/v1/integrations?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"</code></pre>
        </div>

        <div class="endpoint">
            <h3><span class="method post">POST</span> /integrations</h3>
            <p>Create a new integration between two systems.</p>
            
            <h4>Request Body</h4>
            <pre><code>{
  "name": "My Integration",
  "source": "shopify",
  "destination": "salesforce",
  "config": {
    "sync_frequency": "hourly"
  }
}</code></pre>
        </div>
    </div>

    <div class="section" id="errors">
        <h2>Error Handling</h2>
        <p>The API uses conventional HTTP response codes:</p>
        
        <ul>
            <li><strong>200</strong> - OK: Request successful</li>
            <li><strong>201</strong> - Created: Resource created successfully</li>
            <li><strong>400</strong> - Bad Request: Invalid request parameters</li>
            <li><strong>401</strong> - Unauthorized: Authentication required</li>
            <li><strong>404</strong> - Not Found: Resource not found</li>
            <li><strong>500</strong> - Internal Server Error: Server error</li>
        </ul>
    </div>

    <div class="section" id="sdks">
        <h2>SDKs and Libraries</h2>
        <p>Official SDKs are available for popular programming languages:</p>
        
        <ul>
            <li><a href="#">JavaScript/TypeScript SDK</a></li>
            <li><a href="#">Python SDK</a></li>
            <li><a href="#">PHP SDK</a></li>
            <li><a href="#">Java SDK</a></li>
            <li><a href="#">C# SDK</a></li>
            <li><a href="#">Go SDK</a></li>
        </ul>
    </div>
</body>
</html>`

      default:
        return "Documentation content would be generated here..."
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
              description: "You can now access all documentation features without authentication.",
            })
          }}
        >
          🔓 Bypass Login
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation Generator</h1>
          <p className="text-gray-600">Generate comprehensive API documentation in multiple formats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* API Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Select APIs
                </CardTitle>
                <CardDescription>Choose which APIs to include in documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredAPIs.map((api) => (
                    <div
                      key={api.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAPIs.includes(api.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        if (selectedAPIs.includes(api.id)) {
                          setSelectedAPIs(selectedAPIs.filter((id) => id !== api.id))
                        } else {
                          setSelectedAPIs([...selectedAPIs, api.id])
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{api.name}</span>
                          <Badge variant="outline">{api.version}</Badge>
                        </div>
                        <Badge
                          variant={
                            api.status === "active" ? "default" : api.status === "draft" ? "secondary" : "destructive"
                          }
                        >
                          {api.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{api.endpoints} endpoints</span>
                        <span>Updated {api.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  {selectedAPIs.length} of {filteredAPIs.length} APIs selected
                </div>
              </CardContent>
            </Card>

            {/* Documentation Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="format">Output Format</Label>
                  <Select value={config.format} onValueChange={(value: any) => setConfig({ ...config, format: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openapi">OpenAPI (YAML)</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
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
                      {themes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Include Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeExamples" className="text-sm">
                        Code Examples
                      </Label>
                      <Switch
                        id="includeExamples"
                        checked={config.includeExamples}
                        onCheckedChange={(checked) => setConfig({ ...config, includeExamples: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeSchemas" className="text-sm">
                        Data Schemas
                      </Label>
                      <Switch
                        id="includeSchemas"
                        checked={config.includeSchemas}
                        onCheckedChange={(checked) => setConfig({ ...config, includeSchemas: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeAuth" className="text-sm">
                        Authentication
                      </Label>
                      <Switch
                        id="includeAuth"
                        checked={config.includeAuthentication}
                        onCheckedChange={(checked) => setConfig({ ...config, includeAuthentication: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customLogo">Custom Logo URL</Label>
                  <Input
                    id="customLogo"
                    placeholder="https://example.com/logo.png"
                    value={config.customLogo || ""}
                    onChange={(e) => setConfig({ ...config, customLogo: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea
                    id="customCSS"
                    placeholder="/* Custom styles */"
                    value={config.customCSS || ""}
                    onChange={(e) => setConfig({ ...config, customCSS: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <Button onClick={generateDocumentation} disabled={isGenerating} className="w-full mb-3">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Documentation
                    </>
                  )}
                </Button>

                {generatedDocs.length > 0 && (
                  <div className="text-center text-sm text-gray-600">
                    {generatedDocs.length} documentation{generatedDocs.length !== 1 ? "s" : ""} generated
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview and Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {generatedDocs.length > 0 ? (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="generated">Generated Files</TabsTrigger>
                  <TabsTrigger value="interactive">Interactive Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Documentation Preview
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {config.format}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(previewContent)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                          <code>{previewContent}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="generated" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Generated Documentation Files
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium">API Documentation ({doc.format.toUpperCase()})</div>
                                <div className="text-sm text-gray-600">
                                  {doc.size} KB • Generated {new Date(doc.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => setPreviewContent(doc.content)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadDocumentation(doc)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              {doc.url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interactive" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Interactive Documentation
                      </CardTitle>
                      <CardDescription>Live documentation with API testing capabilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Docs Ready</h3>
                        <p className="text-gray-600 mb-4">
                          Your interactive documentation is ready with built-in API testing and bypass authentication.
                        </p>
                        <div className="flex justify-center gap-3">
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Docs
                          </Button>
                          <Button>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Live Docs
                          </Button>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                          <h4 className="font-medium mb-1">API Testing</h4>
                          <p className="text-sm text-gray-600">Test endpoints directly from documentation</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                          <h4 className="font-medium mb-1">Bypass Authentication</h4>
                          <p className="text-sm text-gray-600">Test APIs without authentication setup</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                          <h4 className="font-medium mb-1">Code Examples</h4>
                          <p className="text-sm text-gray-600">Ready-to-use code snippets in multiple languages</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                          <h4 className="font-medium mb-1">Search & Navigation</h4>
                          <p className="text-sm text-gray-600">Easy navigation with search functionality</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              /* Empty State */
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documentation Generated Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Select APIs and configure your documentation settings to generate comprehensive API docs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Code className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Multiple Formats</h4>
                      <p className="text-sm text-gray-600">OpenAPI, Markdown, and HTML output</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Palette className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Customizable</h4>
                      <p className="text-sm text-gray-600">Themes, branding, and custom styling</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Globe className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Interactive</h4>
                      <p className="text-sm text-gray-600">Live testing with bypass authentication</p>
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
