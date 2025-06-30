"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Copy, RefreshCw, Key, Shield, Clock, Zap, AlertTriangle, CheckCircle, SettingsIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiSettings {
  id: string
  name: string
  description: string
  endpoint: string
  version: string
  status: "active" | "inactive" | "maintenance"
  authentication: {
    type: "api_key" | "oauth" | "basic_auth"
    apiKey: string
    refreshToken?: string
    clientId?: string
    clientSecret?: string
  }
  rateLimit: {
    requests: number
    period: "minute" | "hour" | "day"
    burstLimit: number
  }
  timeout: {
    connection: number
    read: number
    write: number
  }
  retry: {
    enabled: boolean
    maxAttempts: number
    backoffMultiplier: number
  }
  monitoring: {
    healthCheck: boolean
    healthCheckInterval: number
    alerting: boolean
    alertThreshold: number
  }
  security: {
    ipWhitelist: string[]
    requireHttps: boolean
    corsEnabled: boolean
    allowedOrigins: string[]
  }
  webhooks: {
    enabled: boolean
    url: string
    events: string[]
    secret: string
  }
}

export default function ApiSettingsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [settings, setSettings] = useState<ApiSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const loadSettings = () => {
      const mockSettings: ApiSettings = {
        id: params.id as string,
        name: "Shopify Store API",
        description: "E-commerce platform integration for product and order data",
        endpoint: "https://mystore.myshopify.com/admin/api/2023-10",
        version: "2023-10",
        status: "active",
        authentication: {
          type: "api_key",
          apiKey: "sk_live_51H*********************",
          refreshToken: "rt_*********************",
        },
        rateLimit: {
          requests: 1000,
          period: "hour",
          burstLimit: 100,
        },
        timeout: {
          connection: 30,
          read: 60,
          write: 30,
        },
        retry: {
          enabled: true,
          maxAttempts: 3,
          backoffMultiplier: 2,
        },
        monitoring: {
          healthCheck: true,
          healthCheckInterval: 300,
          alerting: true,
          alertThreshold: 95,
        },
        security: {
          ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"],
          requireHttps: true,
          corsEnabled: true,
          allowedOrigins: ["https://myapp.com", "https://admin.myapp.com"],
        },
        webhooks: {
          enabled: true,
          url: "https://api.tsmarthub.com/webhooks/shopify",
          events: ["order.created", "order.updated", "product.created"],
          secret: "whsec_*********************",
        },
      }

      setSettings(mockSettings)
      setIsLoading(false)
    }

    setTimeout(loadSettings, 800)
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setHasChanges(false)
    toast({
      title: "Settings saved",
      description: "API configuration has been updated successfully.",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The value has been copied to your clipboard.",
    })
  }

  const generateNewApiKey = () => {
    const newKey = "sk_live_" + Math.random().toString(36).substring(2, 15)
    if (settings) {
      setSettings({
        ...settings,
        authentication: {
          ...settings.authentication,
          apiKey: newKey,
        },
      })
      setHasChanges(true)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
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
              <SettingsIcon className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Settings</h1>
                <p className="text-gray-600">{settings.name} Configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="limits">Rate Limits</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure basic API settings and metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">API Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => {
                        setSettings({ ...settings, name: e.target.value })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={settings.version}
                      onChange={(e) => {
                        setSettings({ ...settings, version: e.target.value })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => {
                      setSettings({ ...settings, description: e.target.value })
                      setHasChanges(true)
                    }}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    value={settings.endpoint}
                    onChange={(e) => {
                      setSettings({ ...settings, endpoint: e.target.value })
                      setHasChanges(true)
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={settings.status}
                    onValueChange={(value: "active" | "inactive" | "maintenance") => {
                      setSettings({ ...settings, status: value })
                      setHasChanges(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Settings */}
          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Authentication Configuration
                </CardTitle>
                <CardDescription>Manage API authentication credentials and methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="auth-type">Authentication Type</Label>
                  <Select
                    value={settings.authentication.type}
                    onValueChange={(value: "api_key" | "oauth" | "basic_auth") => {
                      setSettings({
                        ...settings,
                        authentication: { ...settings.authentication, type: value },
                      })
                      setHasChanges(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.authentication.type === "api_key" && (
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex space-x-2">
                      <Input id="api-key" type="password" value={settings.authentication.apiKey} readOnly />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(settings.authentication.apiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={generateNewApiKey}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {settings.authentication.type === "oauth" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-id">Client ID</Label>
                      <Input
                        id="client-id"
                        value={settings.authentication.clientId || ""}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            authentication: { ...settings.authentication, clientId: e.target.value },
                          })
                          setHasChanges(true)
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-secret">Client Secret</Label>
                      <Input
                        id="client-secret"
                        type="password"
                        value={settings.authentication.clientSecret || ""}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            authentication: { ...settings.authentication, clientSecret: e.target.value },
                          })
                          setHasChanges(true)
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limits */}
          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Rate Limiting
                </CardTitle>
                <CardDescription>Configure request rate limits and throttling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rate-requests">Requests</Label>
                    <Input
                      id="rate-requests"
                      type="number"
                      value={settings.rateLimit.requests}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          rateLimit: { ...settings.rateLimit, requests: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate-period">Period</Label>
                    <Select
                      value={settings.rateLimit.period}
                      onValueChange={(value: "minute" | "hour" | "day") => {
                        setSettings({
                          ...settings,
                          rateLimit: { ...settings.rateLimit, period: value },
                        })
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Per Minute</SelectItem>
                        <SelectItem value="hour">Per Hour</SelectItem>
                        <SelectItem value="day">Per Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="burst-limit">Burst Limit</Label>
                    <Input
                      id="burst-limit"
                      type="number"
                      value={settings.rateLimit.burstLimit}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          rateLimit: { ...settings.rateLimit, burstLimit: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeout Settings
                </CardTitle>
                <CardDescription>Configure connection and request timeouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                    <Input
                      id="connection-timeout"
                      type="number"
                      value={settings.timeout.connection}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          timeout: { ...settings.timeout, connection: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="read-timeout">Read Timeout (seconds)</Label>
                    <Input
                      id="read-timeout"
                      type="number"
                      value={settings.timeout.read}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          timeout: { ...settings.timeout, read: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="write-timeout">Write Timeout (seconds)</Label>
                    <Input
                      id="write-timeout"
                      type="number"
                      value={settings.timeout.write}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          timeout: { ...settings.timeout, write: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Settings */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Health Monitoring
                </CardTitle>
                <CardDescription>Configure health checks and monitoring settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="health-check">Enable Health Checks</Label>
                    <p className="text-sm text-gray-600">Automatically monitor API health status</p>
                  </div>
                  <Switch
                    id="health-check"
                    checked={settings.monitoring.healthCheck}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        monitoring: { ...settings.monitoring, healthCheck: checked },
                      })
                      setHasChanges(true)
                    }}
                  />
                </div>

                {settings.monitoring.healthCheck && (
                  <div>
                    <Label htmlFor="health-interval">Health Check Interval (seconds)</Label>
                    <Input
                      id="health-interval"
                      type="number"
                      value={settings.monitoring.healthCheckInterval}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          monitoring: { ...settings.monitoring, healthCheckInterval: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="alerting">Enable Alerting</Label>
                    <p className="text-sm text-gray-600">Send alerts when issues are detected</p>
                  </div>
                  <Switch
                    id="alerting"
                    checked={settings.monitoring.alerting}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        monitoring: { ...settings.monitoring, alerting: checked },
                      })
                      setHasChanges(true)
                    }}
                  />
                </div>

                {settings.monitoring.alerting && (
                  <div>
                    <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.monitoring.alertThreshold}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          monitoring: { ...settings.monitoring, alertThreshold: Number.parseInt(e.target.value) },
                        })
                        setHasChanges(true)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Configuration
                </CardTitle>
                <CardDescription>Configure security settings and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-https">Require HTTPS</Label>
                    <p className="text-sm text-gray-600">Force all connections to use HTTPS</p>
                  </div>
                  <Switch
                    id="require-https"
                    checked={settings.security.requireHttps}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        security: { ...settings.security, requireHttps: checked },
                      })
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cors-enabled">Enable CORS</Label>
                    <p className="text-sm text-gray-600">Allow cross-origin requests</p>
                  </div>
                  <Switch
                    id="cors-enabled"
                    checked={settings.security.corsEnabled}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        security: { ...settings.security, corsEnabled: checked },
                      })
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                  <Textarea
                    id="ip-whitelist"
                    placeholder="Enter IP addresses or CIDR blocks, one per line"
                    value={settings.security.ipWhitelist.join("\n")}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          ipWhitelist: e.target.value.split("\n").filter((ip) => ip.trim()),
                        },
                      })
                      setHasChanges(true)
                    }}
                    rows={4}
                  />
                </div>

                {settings.security.corsEnabled && (
                  <div>
                    <Label htmlFor="allowed-origins">Allowed Origins</Label>
                    <Textarea
                      id="allowed-origins"
                      placeholder="Enter allowed origins, one per line"
                      value={settings.security.allowedOrigins.join("\n")}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            allowedOrigins: e.target.value.split("\n").filter((origin) => origin.trim()),
                          },
                        })
                        setHasChanges(true)
                      }}
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Settings */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>Configure webhook endpoints and event subscriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="webhooks-enabled">Enable Webhooks</Label>
                    <p className="text-sm text-gray-600">Send HTTP callbacks for events</p>
                  </div>
                  <Switch
                    id="webhooks-enabled"
                    checked={settings.webhooks.enabled}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        webhooks: { ...settings.webhooks, enabled: checked },
                      })
                      setHasChanges(true)
                    }}
                  />
                </div>

                {settings.webhooks.enabled && (
                  <>
                    <div>
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        type="url"
                        value={settings.webhooks.url}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            webhooks: { ...settings.webhooks, url: e.target.value },
                          })
                          setHasChanges(true)
                        }}
                        placeholder="https://your-app.com/webhooks"
                      />
                    </div>

                    <div>
                      <Label htmlFor="webhook-secret">Webhook Secret</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="webhook-secret"
                          type="password"
                          value={settings.webhooks.secret}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              webhooks: { ...settings.webhooks, secret: e.target.value },
                            })
                            setHasChanges(true)
                          }}
                        />
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(settings.webhooks.secret)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="webhook-events">Subscribed Events</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          "order.created",
                          "order.updated",
                          "order.cancelled",
                          "product.created",
                          "product.updated",
                          "customer.created",
                        ].map((event) => (
                          <div key={event} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={event}
                              checked={settings.webhooks.events.includes(event)}
                              onChange={(e) => {
                                const events = e.target.checked
                                  ? [...settings.webhooks.events, event]
                                  : settings.webhooks.events.filter((e) => e !== event)
                                setSettings({
                                  ...settings,
                                  webhooks: { ...settings.webhooks, events },
                                })
                                setHasChanges(true)
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={event} className="text-sm">
                              {event}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
