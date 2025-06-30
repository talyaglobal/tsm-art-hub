"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Database,
  Settings,
  Shield,
  HardDrive,
  Network,
  Save,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DatabaseConfig {
  id: string
  name: string
  description: string
  type: string
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  connectionPool: {
    min: number
    max: number
    idleTimeout: number
  }
  backup: {
    enabled: boolean
    frequency: string
    retention: number
  }
  monitoring: {
    enabled: boolean
    alertThreshold: number
  }
  tags: string[]
}

export default function DatabaseConfigurePage() {
  const params = useParams()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isSaving, setIsSaving] = useState(false)

  const [config, setConfig] = useState<DatabaseConfig>({
    id: params.id as string,
    name: "Primary PostgreSQL",
    description: "Main production database for user data and transactions",
    type: "postgresql",
    host: "db-primary.tsmarthub.com",
    port: 5432,
    database: "tsmarthub_prod",
    username: "admin",
    password: "••••••••••••",
    ssl: true,
    connectionPool: {
      min: 5,
      max: 100,
      idleTimeout: 300,
    },
    backup: {
      enabled: true,
      frequency: "daily",
      retention: 30,
    },
    monitoring: {
      enabled: true,
      alertThreshold: 80,
    },
    tags: ["production", "primary", "postgresql"],
  })

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")

    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success/failure
    const success = Math.random() > 0.3
    setConnectionStatus(success ? "success" : "error")
    setIsTestingConnection(false)

    toast({
      title: success ? "Connection Successful" : "Connection Failed",
      description: success
        ? "Database connection established successfully"
        : "Unable to connect to database. Please check your settings.",
      variant: success ? "default" : "destructive",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    toast({
      title: "Configuration Saved",
      description: "Database configuration has been updated successfully.",
    })
  }

  const addTag = (tag: string) => {
    if (tag && !config.tags.includes(tag)) {
      setConfig((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configure: {config.name}</h1>
          <p className="text-gray-600">Manage database connection settings and configuration</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleTestConnection} disabled={isTestingConnection}>
            <TestTube className={`h-4 w-4 mr-2 ${isTestingConnection ? "animate-pulse" : ""}`} />
            Test Connection
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className={`h-4 w-4 mr-2 ${isSaving ? "animate-pulse" : ""}`} />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus !== "idle" && (
        <Card className={connectionStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {connectionStatus === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${connectionStatus === "success" ? "text-green-800" : "text-red-800"}`}>
                {connectionStatus === "success" ? "Connection Successful" : "Connection Failed"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>Configure basic database information and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Database Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter database name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Database Type</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                      <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and usage of this database"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {config.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Connection Settings</span>
              </CardTitle>
              <CardDescription>Configure database connection parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={config.host}
                    onChange={(e) => setConfig((prev) => ({ ...prev, host: e.target.value }))}
                    placeholder="database.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig((prev) => ({ ...prev, port: Number.parseInt(e.target.value) }))}
                    placeholder="5432"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  value={config.database}
                  onChange={(e) => setConfig((prev) => ({ ...prev, database: e.target.value }))}
                  placeholder="database_name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={config.username}
                    onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="database_user"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={config.password}
                      onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Configure security and encryption settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SSL/TLS Encryption</Label>
                  <div className="text-sm text-gray-500">Enable secure encrypted connections to the database</div>
                </div>
                <Switch
                  checked={config.ssl}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, ssl: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Monitoring</Label>
                  <div className="text-sm text-gray-500">Monitor database connections and performance</div>
                </div>
                <Switch
                  checked={config.monitoring.enabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, enabled: checked },
                    }))
                  }
                />
              </div>

              {config.monitoring.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                  <Input
                    id="alertThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={config.monitoring.alertThreshold}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        monitoring: { ...prev.monitoring, alertThreshold: Number.parseInt(e.target.value) },
                      }))
                    }
                    placeholder="80"
                  />
                  <div className="text-sm text-gray-500">Trigger alerts when resource usage exceeds this threshold</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Performance Settings</span>
              </CardTitle>
              <CardDescription>Configure connection pooling and performance parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minConnections">Min Connections</Label>
                  <Input
                    id="minConnections"
                    type="number"
                    min="1"
                    value={config.connectionPool.min}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        connectionPool: { ...prev.connectionPool, min: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxConnections">Max Connections</Label>
                  <Input
                    id="maxConnections"
                    type="number"
                    min="1"
                    value={config.connectionPool.max}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        connectionPool: { ...prev.connectionPool, max: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idleTimeout">Idle Timeout (seconds)</Label>
                  <Input
                    id="idleTimeout"
                    type="number"
                    min="0"
                    value={config.connectionPool.idleTimeout}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        connectionPool: { ...prev.connectionPool, idleTimeout: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Connection pooling helps manage database connections efficiently. Set minimum connections to maintain
                baseline performance and maximum connections to prevent resource exhaustion.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Backup Configuration</span>
              </CardTitle>
              <CardDescription>Configure automated backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Automatic Backups</Label>
                  <div className="text-sm text-gray-500">Automatically create database backups on a schedule</div>
                </div>
                <Switch
                  checked={config.backup.enabled}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      backup: { ...prev.backup, enabled: checked },
                    }))
                  }
                />
              </div>

              {config.backup.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Backup Frequency</Label>
                      <Select
                        value={config.backup.frequency}
                        onValueChange={(value) =>
                          setConfig((prev) => ({
                            ...prev,
                            backup: { ...prev.backup, frequency: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retention">Retention Period (days)</Label>
                      <Input
                        id="retention"
                        type="number"
                        min="1"
                        value={config.backup.retention}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            backup: { ...prev.backup, retention: Number.parseInt(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Backups will be automatically deleted after the retention period expires. Choose a frequency and
                    retention period that balances storage costs with recovery needs.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
