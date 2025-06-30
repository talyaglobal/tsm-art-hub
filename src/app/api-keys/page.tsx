"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Key, Plus, Copy, Eye, EyeOff, Trash2, MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BackButton } from "@/components/ui/back-button"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  created: string
  status: "active" | "inactive" | "revoked"
  usage: {
    requests: number
    limit: number
  }
  expiresAt?: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [newKey, setNewKey] = useState({
    name: "",
    permissions: [] as string[],
    expiresIn: "never",
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      // Simulate API call
      const mockKeys: ApiKey[] = [
        {
          id: "1",
          name: "Production API",
          key: "sk_live_51H7***************************",
          permissions: ["read", "write"],
          lastUsed: "2 hours ago",
          created: "2024-01-15",
          status: "active",
          usage: { requests: 15420, limit: 100000 },
          expiresAt: "2024-12-31",
        },
        {
          id: "2",
          name: "Development API",
          key: "sk_test_51H7***************************",
          permissions: ["read"],
          lastUsed: "1 day ago",
          created: "2024-01-10",
          status: "active",
          usage: { requests: 2847, limit: 10000 },
        },
        {
          id: "3",
          name: "Legacy Integration",
          key: "sk_live_51G6***************************",
          permissions: ["read", "write", "admin"],
          lastUsed: "1 week ago",
          created: "2023-12-01",
          status: "inactive",
          usage: { requests: 0, limit: 50000 },
          expiresAt: "2024-06-01",
        },
      ]
      setApiKeys(mockKeys)
    } catch (error) {
      console.error("Failed to load API keys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createApiKey = async () => {
    try {
      // Simulate API call
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name: newKey.name,
        key: `sk_live_${Math.random().toString(36).substr(2, 32)}`,
        permissions: newKey.permissions,
        lastUsed: "Never",
        created: new Date().toISOString().split("T")[0],
        status: "active",
        usage: { requests: 0, limit: 10000 },
        expiresAt: newKey.expiresIn !== "never" ? "2024-12-31" : undefined,
      }

      setApiKeys([newApiKey, ...apiKeys])
      setShowCreateDialog(false)
      setNewKey({ name: "", permissions: [], expiresIn: "never" })
    } catch (error) {
      console.error("Failed to create API key:", error)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const revokeKey = async (keyId: string) => {
    setApiKeys(apiKeys.map((key) => (key.id === keyId ? { ...key, status: "revoked" as const } : key)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "revoked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API keys...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
              <p className="text-gray-600">Manage your API authentication keys</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>Generate a new API key for your applications</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="Production API Key"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2 mt-2">
                      {["read", "write", "admin"].map((permission) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newKey.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewKey({ ...newKey, permissions: [...newKey.permissions, permission] })
                              } else {
                                setNewKey({
                                  ...newKey,
                                  permissions: newKey.permissions.filter((p) => p !== permission),
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Expires</Label>
                    <Select
                      value={newKey.expiresIn}
                      onValueChange={(value) => setNewKey({ ...newKey, expiresIn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="1y">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={createApiKey}
                    className="w-full"
                    disabled={!newKey.name || newKey.permissions.length === 0}
                  >
                    Create API Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Keys List */}
        <div className="space-y-6">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                      <CardDescription>Created on {apiKey.created}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(apiKey.status)}>
                      {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Key
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => revokeKey(apiKey.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* API Key Display */}
                  <div>
                    <Label className="text-sm font-medium">API Key</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.key.replace(/./g, "•")}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Permissions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Last Used</Label>
                      <p className="text-sm font-medium mt-1">{apiKey.lastUsed}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Usage</Label>
                      <p className="text-sm font-medium mt-1">
                        {apiKey.usage.requests.toLocaleString()} / {apiKey.usage.limit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Expires</Label>
                      <p className="text-sm font-medium mt-1">{apiKey.expiresAt || "Never"}</p>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Usage</span>
                      <span>{Math.round((apiKey.usage.requests / apiKey.usage.limit) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(apiKey.usage.requests / apiKey.usage.limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>How to use your API keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <p className="text-sm text-gray-600 mb-2">Include your API key in the Authorization header:</p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.tsmarthub.com/v1/integrations`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">https://api.tsmarthub.com/v1</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Rate Limits</h4>
                <p className="text-sm text-gray-600">API keys are rate limited based on your subscription plan.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
