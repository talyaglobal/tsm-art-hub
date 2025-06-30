"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, Key, Lock, AlertTriangle, Plus, Eye, EyeOff, Copy, RotateCcw, Trash2, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/components/ui/back-button"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  created: string
  status: "active" | "inactive"
}

interface SecurityEvent {
  id: string
  type: "auth_success" | "auth_failure" | "rate_limit" | "suspicious"
  api: string
  timestamp: string
  details: string
  severity: "low" | "medium" | "high"
}

export default function SecurityPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSecurityData = () => {
      setApiKeys([
        {
          id: "1",
          name: "Production API Key",
          key: "sk_live_51H7zBkJ2...",
          permissions: ["read", "write"],
          lastUsed: "2 minutes ago",
          created: "2024-01-15",
          status: "active",
        },
        {
          id: "2",
          name: "Development API Key",
          key: "sk_test_51H7zBkJ2...",
          permissions: ["read"],
          lastUsed: "1 hour ago",
          created: "2024-01-10",
          status: "active",
        },
        {
          id: "3",
          name: "Analytics API Key",
          key: "sk_analytics_51H7z...",
          permissions: ["read"],
          lastUsed: "5 minutes ago",
          created: "2024-01-08",
          status: "active",
        },
      ])

      setSecurityEvents([
        {
          id: "1",
          type: "auth_failure",
          api: "Stripe API",
          timestamp: "5 minutes ago",
          details: "Invalid API key used from IP 192.168.1.100",
          severity: "high",
        },
        {
          id: "2",
          type: "rate_limit",
          api: "Shopify API",
          timestamp: "15 minutes ago",
          details: "Rate limit exceeded - 1000 requests in 1 minute",
          severity: "medium",
        },
        {
          id: "3",
          type: "auth_success",
          api: "QuickBooks API",
          timestamp: "30 minutes ago",
          details: "Successful authentication and data sync",
          severity: "low",
        },
        {
          id: "4",
          type: "suspicious",
          api: "WMS API",
          timestamp: "1 hour ago",
          details: "Unusual access pattern detected from new location",
          severity: "medium",
        },
      ])

      setIsLoading(false)
    }

    setTimeout(loadSecurityData, 800)
  }, [])

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "auth_failure":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "auth_success":
        return <Shield className="h-4 w-4 text-green-500" />
      case "rate_limit":
        return <Lock className="h-4 w-4 text-yellow-500" />
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security & Access Control</h1>
              <p className="text-gray-600">Manage API keys, authentication, and security monitoring</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key with specific permissions for your integrations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input id="keyName" placeholder="e.g., Production Key" />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Read access</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Write access</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Admin access</span>
                      </label>
                    </div>
                  </div>
                  <Button className="w-full">Generate Key</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
              <Key className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.filter((k) => k.status === "active").length}</div>
              <p className="text-xs text-gray-600 mt-1">{apiKeys.length} total keys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityEvents.length}</div>
              <p className="text-xs text-red-600 mt-1">
                {securityEvents.filter((e) => e.severity === "high").length} high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Lock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-green-600 mt-1">Good security posture</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Keys Management */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys and access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge
                        className={
                          apiKey.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {apiKey.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {showKeys[apiKey.id] ? apiKey.key : "••••••••••••••••"}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                        {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        <span>Permissions: </span>
                        {apiKey.permissions.map((perm, index) => (
                          <Badge key={index} variant="outline" className="mr-1 text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Last used: {apiKey.lastUsed}</span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Recent security events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{event.api}</h4>
                          <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                        <p className="text-xs text-gray-500">{event.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
