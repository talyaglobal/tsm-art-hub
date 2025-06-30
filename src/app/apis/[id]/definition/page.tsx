"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Save,
  Plus,
  Play,
  Settings,
  Shield,
  Zap,
  RefreshCw,
  Code,
  Lock,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ApiDefinition } from "@/types/api-definition"

export default function ApiDefinitionPage() {
  const params = useParams()
  const { toast } = useToast()
  const [definition, setDefinition] = useState<ApiDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("endpoint")

  useEffect(() => {
    const loadDefinition = () => {
      // Mock API definition
      const mockDefinition: ApiDefinition = {
        id: params.id as string,
        tenantId: "tenant-1",
        name: "E-commerce Product API",
        description: "Unified API for managing products across multiple e-commerce platforms",
        version: "v1.0.0",
        status: "active",
        endpoint: {
          path: "/api/v1/products",
          methods: ["GET", "POST", "PUT", "DELETE"],
          backend: {
            type: "http",
            url: "https://api.shopify.com/admin/api/2023-10",
            timeout: 30000,
            retries: {
              attempts: 3,
              backoff: "exponential",
              delay: 1000,
              retryOn: [502, 503, 504],
            },
          },
          parameters: [
            {
              name: "id",
              in: "path",
              type: "string",
              required: true,
              description: "Product ID",
            },
            {
              name: "limit",
              in: "query",
              type: "number",
              required: false,
              description: "Number of products to return",
            },
          ],
        },
        policies: {
          authentication: [
            {
              id: "auth-1",
              name: "API Key Authentication",
              type: "api_key",
              enabled: true,
              priority: 1,
              config: {
                apiKey: {
                  location: "header",
                  name: "X-API-Key",
                  prefix: "Bearer ",
                },
              },
            },
          ],
          authorization: [
            {
              id: "authz-1",
              name: "Role-Based Access",
              type: "rbac",
              enabled: true,
              priority: 1,
              config: {
                rbac: {
                  roles: ["admin", "user"],
                  permissions: ["read", "write"],
                  roleMapping: {
                    admin: ["read", "write"],
                    user: ["read"],
                  },
                },
              },
            },
          ],
          rateLimit: [
            {
              id: "rate-1",
              name: "Standard Rate Limit",
              enabled: true,
              priority: 1,
              config: {
                requests: 1000,
                window: 3600,
                windowType: "sliding",
                keyBy: "api_key",
                headers: true,
                message: "Rate limit exceeded. Please try again later.",
              },
            },
          ],
          transformation: [
            {
              id: "transform-1",
              name: "Response Transformation",
              type: "response",
              enabled: true,
              priority: 1,
              config: {
                headers: {
                  add: {
                    "X-Powered-By": "TSmart Hub",
                    "X-API-Version": "v1.0.0",
                  },
                },
                body: {
                  type: "json",
                  transformations: [
                    {
                      type: "template",
                      expression: "{{data}}",
                      target: "products",
                    },
                  ],
                },
              },
            },
          ],
          caching: [
            {
              id: "cache-1",
              name: "Product Cache",
              enabled: true,
              priority: 1,
              config: {
                ttl: 300,
                keyBy: ["request.path", "request.query.limit"],
                storage: "redis",
                behavior: {
                  staleWhileRevalidate: 60,
                  staleIfError: 300,
                },
              },
            },
          ],
          security: [
            {
              id: "security-1",
              name: "CORS Policy",
              type: "cors",
              enabled: true,
              priority: 1,
              config: {
                cors: {
                  origins: ["https://mystore.com", "https://admin.mystore.com"],
                  methods: ["GET", "POST", "PUT", "DELETE"],
                  headers: ["Content-Type", "Authorization", "X-API-Key"],
                  credentials: true,
                  maxAge: 86400,
                },
              },
            },
          ],
        },
        tags: ["ecommerce", "products", "shopify"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
        createdBy: "user-1",
      }

      setDefinition(mockDefinition)
      setIsLoading(false)
    }

    setTimeout(loadDefinition, 800)
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setHasChanges(false)
    toast({
      title: "API Definition Saved",
      description: "Your API configuration has been updated successfully.",
    })
  }

  const testPolicy = async (policyId: string) => {
    toast({
      title: "Testing Policy",
      description: "Running policy validation tests...",
    })

    // Simulate policy test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Policy Test Complete",
      description: "All policy validations passed successfully.",
    })
  }

  const addPolicy = (type: string) => {
    // Add new policy logic
    setHasChanges(true)
    toast({
      title: "Policy Added",
      description: `New ${type} policy has been added to the configuration.`,
    })
  }

  if (isLoading || !definition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API definition...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Code className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Definition</h1>
                <p className="text-gray-600">{definition.name}</p>
              </div>
              <Badge variant={definition.status === "active" ? "default" : "secondary"}>{definition.status}</Badge>
            </div>
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              <Button variant="outline" onClick={() => testPolicy("all")}>
                <Play className="h-4 w-4 mr-2" />
                Test Policies
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Definition
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="authorization">Authorization</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="transformation">Transform</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Endpoint Configuration */}
          <TabsContent value="endpoint" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Configuration</CardTitle>
                <CardDescription>Define the API endpoint and backend configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-name">API Name</Label>
                    <Input
                      id="api-name"
                      value={definition.name}
                      onChange={(e) => {
                        setDefinition({ ...definition, name: e.target.value })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-version">Version</Label>
                    <Input
                      id="api-version"
                      value={definition.version}
                      onChange={(e) => {
                        setDefinition({ ...definition, version: e.target.value })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-description">Description</Label>
                  <Textarea
                    id="api-description"
                    value={definition.description || ""}
                    onChange={(e) => {
                      setDefinition({ ...definition, description: e.target.value })
                      setHasChanges(true)
                    }}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frontend-path">Frontend Path</Label>
                    <Input
                      id="frontend-path"
                      value={definition.endpoint.path}
                      onChange={(e) => {
                        setDefinition({
                          ...definition,
                          endpoint: { ...definition.endpoint, path: e.target.value },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backend-url">Backend URL</Label>
                    <Input
                      id="backend-url"
                      value={definition.endpoint.backend.url}
                      onChange={(e) => {
                        setDefinition({
                          ...definition,
                          endpoint: {
                            ...definition.endpoint,
                            backend: { ...definition.endpoint.backend, url: e.target.value },
                          },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>HTTP Methods</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={method}
                          checked={definition.endpoint.methods.includes(method as any)}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...definition.endpoint.methods, method as any]
                              : definition.endpoint.methods.filter((m) => m !== method)
                            setDefinition({
                              ...definition,
                              endpoint: { ...definition.endpoint, methods },
                            })
                            setHasChanges(true)
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={method} className="text-sm font-medium">
                          {method}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Policies */}
          <TabsContent value="authentication" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Authentication Policies</h3>
                <p className="text-gray-600">Configure how users authenticate with your API</p>
              </div>
              <Button onClick={() => addPolicy("authentication")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            {definition.policies.authentication?.map((policy, index) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <CardDescription>{policy.type.toUpperCase()} Authentication</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(enabled) => {
                          const updatedPolicies = [...(definition.policies.authentication || [])]
                          updatedPolicies[index] = { ...policy, enabled }
                          setDefinition({
                            ...definition,
                            policies: {
                              ...definition.policies,
                              authentication: updatedPolicies,
                            },
                          })
                          setHasChanges(true)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => testPolicy(policy.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Badge variant="outline">{policy.type}</Badge>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge variant="secondary">{policy.priority}</Badge>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge variant={policy.enabled ? "default" : "secondary"}>
                        {policy.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  {policy.type === "api_key" && policy.config.apiKey && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">API Key Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label>Location</Label>
                          <p className="text-gray-600">{policy.config.apiKey.location}</p>
                        </div>
                        <div>
                          <Label>Header/Parameter Name</Label>
                          <p className="text-gray-600">{policy.config.apiKey.name}</p>
                        </div>
                        <div>
                          <Label>Prefix</Label>
                          <p className="text-gray-600">{policy.config.apiKey.prefix || "None"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Authorization Policies */}
          <TabsContent value="authorization" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Authorization Policies</h3>
                <p className="text-gray-600">Define access control and permissions</p>
              </div>
              <Button onClick={() => addPolicy("authorization")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            {definition.policies.authorization?.map((policy, index) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <CardDescription>{policy.type.toUpperCase()} Authorization</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(enabled) => {
                          const updatedPolicies = [...(definition.policies.authorization || [])]
                          updatedPolicies[index] = { ...policy, enabled }
                          setDefinition({
                            ...definition,
                            policies: {
                              ...definition.policies,
                              authorization: updatedPolicies,
                            },
                          })
                          setHasChanges(true)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => testPolicy(policy.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {policy.type === "rbac" && policy.config.rbac && (
                    <div className="space-y-4">
                      <div>
                        <Label>Required Roles</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {policy.config.rbac.roles.map((role: string) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {policy.config.rbac.permissions.map((permission: string) => (
                            <Badge key={permission} variant="secondary">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Traffic Management */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Traffic Management</h3>
                <p className="text-gray-600">Configure rate limiting, quotas, and caching</p>
              </div>
              <Button onClick={() => addPolicy("traffic")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            {/* Rate Limiting */}
            {definition.policies.rateLimit?.map((policy, index) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <CardDescription>Rate Limiting Policy</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(enabled) => {
                          const updatedPolicies = [...(definition.policies.rateLimit || [])]
                          updatedPolicies[index] = { ...policy, enabled }
                          setDefinition({
                            ...definition,
                            policies: {
                              ...definition.policies,
                              rateLimit: updatedPolicies,
                            },
                          })
                          setHasChanges(true)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => testPolicy(policy.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Requests</Label>
                      <p className="text-2xl font-bold text-blue-600">{policy.config.requests}</p>
                    </div>
                    <div>
                      <Label>Window</Label>
                      <p className="text-lg font-semibold">{policy.config.window}s</p>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Badge variant="outline">{policy.config.windowType}</Badge>
                    </div>
                    <div>
                      <Label>Key By</Label>
                      <Badge variant="secondary">{policy.config.keyBy}</Badge>
                    </div>
                  </div>

                  {policy.config.message && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Label className="text-yellow-800">Custom Message</Label>
                      <p className="text-yellow-700 text-sm mt-1">{policy.config.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Caching */}
            {definition.policies.caching?.map((policy, index) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <CardDescription>Caching Policy</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(enabled) => {
                          const updatedPolicies = [...(definition.policies.caching || [])]
                          updatedPolicies[index] = { ...policy, enabled }
                          setDefinition({
                            ...definition,
                            policies: {
                              ...definition.policies,
                              caching: updatedPolicies,
                            },
                          })
                          setHasChanges(true)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => testPolicy(policy.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>TTL</Label>
                      <p className="text-2xl font-bold text-green-600">{policy.config.ttl}s</p>
                    </div>
                    <div>
                      <Label>Storage</Label>
                      <Badge variant="outline">{policy.config.storage}</Badge>
                    </div>
                    <div>
                      <Label>Key Fields</Label>
                      <p className="text-sm text-gray-600">{policy.config.keyBy.length} fields</p>
                    </div>
                    <div>
                      <Label>Stale While Revalidate</Label>
                      <p className="text-lg font-semibold">{policy.config.behavior.staleWhileRevalidate}s</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Cache Key Fields</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {policy.config.keyBy.map((field: string) => (
                        <Badge key={field} variant="secondary">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Transformation Policies */}
          <TabsContent value="transformation" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Transformation Policies</h3>
                <p className="text-gray-600">Modify requests and responses</p>
              </div>
              <Button onClick={() => addPolicy("transformation")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            {definition.policies.transformation?.map((policy, index) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ArrowRight className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <CardDescription>{policy.type} Transformation</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(enabled) => {
                          const updatedPolicies = [...(definition.policies.transformation || [])]
                          updatedPolicies[index] = { ...policy, enabled }
                          setDefinition({
                            ...definition,
                            policies: {
                              ...definition.policies,
                              transformation: updatedPolicies,
                            },
                          })
                          setHasChanges(true)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => testPolicy(policy.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {policy.config.headers?.add && (
                      <div>
                        <Label>Add Headers</Label>
                        <div className="mt-2 space-y-2">
                          {Object.entries(policy.config.headers.add).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-mono text-sm">{key}</span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-sm text-blue-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {policy.config.body && (
                      <div>
                        <Label>Body Transformations</Label>
                        <div className="mt-2 space-y-2">
                          {policy.config.body.transformations.map((transform, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{transform.type}</Badge>
                                <Badge variant="secondary">{policy.config.body?.type}</Badge>
                              </div>
                              <code className="text-sm text-gray-700">{transform.expression}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Security Policies */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Security Policies</h3>
                <p className="text-gray-600">Configure CORS, CSRF, and other security measures</p>
              </div>
              <Button onClick={() => addPolicy("security")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            {definition.policies.security?.map((policy, index) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <CardDescription>{policy.type.toUpperCase()} Security Policy</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(enabled) => {
                          const updatedPolicies = [...(definition.policies.security || [])]
                          updatedPolicies[index] = { ...policy, enabled }
                          setDefinition({
                            ...definition,
                            policies: {
                              ...definition.policies,
                              security: updatedPolicies,
                            },
                          })
                          setHasChanges(true)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => testPolicy(policy.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {policy.type === "cors" && policy.config.cors && (
                    <div className="space-y-4">
                      <div>
                        <Label>Allowed Origins</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {policy.config.cors.origins.map((origin: string) => (
                            <Badge key={origin} variant="outline">
                              {origin}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Allowed Methods</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {policy.config.cors.methods.map((method: string) => (
                            <Badge key={method} variant="secondary">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Allowed Headers</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {policy.config.cors.headers.map((header: string) => (
                            <Badge key={header} variant="outline">
                              {header}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Credentials</Label>
                          <Badge variant={policy.config.cors.credentials ? "default" : "secondary"}>
                            {policy.config.cors.credentials ? "Allowed" : "Not Allowed"}
                          </Badge>
                        </div>
                        <div>
                          <Label>Max Age</Label>
                          <p className="text-lg font-semibold">{policy.config.cors.maxAge}s</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Execution Summary</CardTitle>
                <CardDescription>Overview of all configured policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {
                        Object.values(definition.policies)
                          .flat()
                          .filter((p: any) => p?.enabled).length
                      }
                    </div>
                    <p className="text-sm text-gray-600">Active Policies</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Object.values(definition.policies).flat().length}
                    </div>
                    <p className="text-sm text-gray-600">Total Policies</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {Object.keys(definition.policies).length}
                    </div>
                    <p className="text-sm text-gray-600">Policy Types</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold">Policy Execution Order</h4>
                  <div className="space-y-2">
                    {Object.entries(definition.policies)
                      .flatMap(
                        ([type, policies]) => (policies as any[])?.map((p) => ({ ...p, policyType: type })) || [],
                      )
                      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                      .map((policy, index) => (
                        <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{policy.name}</p>
                              <p className="text-sm text-gray-600">{policy.policyType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={policy.enabled ? "default" : "secondary"}>
                              {policy.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            <Badge variant="outline">Priority {policy.priority}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
