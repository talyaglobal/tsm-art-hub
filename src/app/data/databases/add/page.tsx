"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/layout/page-header"
import { useToast } from "@/hooks/use-toast"
import {
  Database,
  TestTube,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Info,
  Shield,
  Settings,
  Zap,
} from "lucide-react"

interface DatabaseConfig {
  name: string
  type: "postgresql" | "mysql" | "mongodb" | "redis" | "elasticsearch" | "sqlite"
  host: string
  port: string
  database: string
  username: string
  password: string
  ssl: boolean
  description: string
  tags: string[]
  connectionPool: {
    min: number
    max: number
    idle: number
  }
  backup: {
    enabled: boolean
    frequency: "hourly" | "daily" | "weekly"
    retention: number
  }
}

const databaseTypes = [
  { value: "postgresql", label: "PostgreSQL", icon: "🐘", port: "5432" },
  { value: "mysql", label: "MySQL", icon: "🐬", port: "3306" },
  { value: "mongodb", label: "MongoDB", icon: "🍃", port: "27017" },
  { value: "redis", label: "Redis", icon: "🔴", port: "6379" },
  { value: "elasticsearch", label: "Elasticsearch", icon: "🔍", port: "9200" },
  { value: "sqlite", label: "SQLite", icon: "📁", port: "" },
]

export default function AddDatabasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [config, setConfig] = useState<DatabaseConfig>({
    name: "",
    type: "postgresql",
    host: "",
    port: "5432",
    database: "",
    username: "",
    password: "",
    ssl: false,
    description: "",
    tags: [],
    connectionPool: {
      min: 5,
      max: 20,
      idle: 10,
    },
    backup: {
      enabled: true,
      frequency: "daily",
      retention: 7,
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!config.name.trim()) newErrors.name = "Database name is required"
    if (!config.host.trim() && config.type !== "sqlite") newErrors.host = "Host is required"
    if (!config.port.trim() && config.type !== "sqlite") newErrors.port = "Port is required"
    if (!config.database.trim()) newErrors.database = "Database name is required"
    if (!config.username.trim() && config.type !== "sqlite") newErrors.username = "Username is required"
    if (!config.password.trim() && config.type !== "sqlite") newErrors.password = "Password is required"

    // Port validation
    if (config.port && (isNaN(Number(config.port)) || Number(config.port) < 1 || Number(config.port) > 65535)) {
      newErrors.port = "Port must be a number between 1 and 65535"
    }

    // Connection pool validation
    if (config.connectionPool.min < 1) newErrors.poolMin = "Minimum connections must be at least 1"
    if (config.connectionPool.max < config.connectionPool.min) {
      newErrors.poolMax = "Maximum connections must be greater than minimum"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTypeChange = (type: string) => {
    const dbType = databaseTypes.find((t) => t.value === type)
    setConfig((prev) => ({
      ...prev,
      type: type as DatabaseConfig["type"],
      port: dbType?.port || "",
    }))
  }

  const testConnection = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before testing the connection.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      // Simulate API call to test connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate random success/failure for demo
      const success = Math.random() > 0.3

      if (success) {
        setTestResult("success")
        toast({
          title: "Connection Successful",
          description: "Database connection has been established successfully.",
        })
      } else {
        setTestResult("error")
        toast({
          title: "Connection Failed",
          description: "Unable to connect to the database. Please check your credentials.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setTestResult("error")
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all form errors before saving.",
        variant: "destructive",
      })
      return
    }

    if (testResult !== "success") {
      toast({
        title: "Connection Required",
        description: "Please test the connection successfully before saving.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call to save database
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Database Added",
        description: `${config.name} has been added successfully.`,
      })

      router.push("/data/databases")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !config.tags.includes(tag)) {
      setConfig((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tag: string) => {
    setConfig((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const selectedDbType = databaseTypes.find((t) => t.value === config.type)

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Add Database Connection"
        description="Configure a new database connection for your application"
      />

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span className="font-medium">Basic Info</span>
              </div>
              <div className="w-12 h-px bg-gray-300" />
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span className="font-medium">Connection</span>
              </div>
              <div className="w-12 h-px bg-gray-300" />
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  3
                </div>
                <span className="font-medium">Advanced</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>Configure the basic database information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Database Name *</Label>
                    <Input
                      id="name"
                      value={config.name}
                      onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="My Database"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="type">Database Type *</Label>
                    <Select value={config.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose of this database..."
                    rows={3}
                  />
                </div>

                <div>
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

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)}>Next: Connection Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Connection Settings */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Connection Settings</span>
                </CardTitle>
                <CardDescription>Configure the database connection parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.type !== "sqlite" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="host">Host *</Label>
                        <Input
                          id="host"
                          value={config.host}
                          onChange={(e) => setConfig((prev) => ({ ...prev, host: e.target.value }))}
                          placeholder="localhost or IP address"
                          className={errors.host ? "border-red-500" : ""}
                        />
                        {errors.host && <p className="text-sm text-red-500 mt-1">{errors.host}</p>}
                      </div>

                      <div>
                        <Label htmlFor="port">Port *</Label>
                        <Input
                          id="port"
                          value={config.port}
                          onChange={(e) => setConfig((prev) => ({ ...prev, port: e.target.value }))}
                          placeholder={selectedDbType?.port}
                          className={errors.port ? "border-red-500" : ""}
                        />
                        {errors.port && <p className="text-sm text-red-500 mt-1">{errors.port}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="database">Database Name *</Label>
                      <Input
                        id="database"
                        value={config.database}
                        onChange={(e) => setConfig((prev) => ({ ...prev, database: e.target.value }))}
                        placeholder="database_name"
                        className={errors.database ? "border-red-500" : ""}
                      />
                      {errors.database && <p className="text-sm text-red-500 mt-1">{errors.database}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username *</Label>
                        <Input
                          id="username"
                          value={config.username}
                          onChange={(e) => setConfig((prev) => ({ ...prev, username: e.target.value }))}
                          placeholder="database_user"
                          className={errors.username ? "border-red-500" : ""}
                        />
                        {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                      </div>

                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={config.password}
                            onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ssl"
                        checked={config.ssl}
                        onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, ssl: checked }))}
                      />
                      <Label htmlFor="ssl" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Enable SSL/TLS</span>
                      </Label>
                    </div>
                  </>
                )}

                {config.type === "sqlite" && (
                  <div>
                    <Label htmlFor="database">Database File Path *</Label>
                    <Input
                      id="database"
                      value={config.database}
                      onChange={(e) => setConfig((prev) => ({ ...prev, database: e.target.value }))}
                      placeholder="/path/to/database.db"
                      className={errors.database ? "border-red-500" : ""}
                    />
                    {errors.database && <p className="text-sm text-red-500 mt-1">{errors.database}</p>}
                  </div>
                )}

                <Separator />

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTesting}
                    className="flex items-center space-x-2"
                  >
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                    <span>{isTesting ? "Testing..." : "Test Connection"}</span>
                  </Button>

                  {testResult === "success" && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Connection successful</span>
                    </div>
                  )}

                  {testResult === "error" && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Connection failed</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} disabled={testResult !== "success"}>
                    Next: Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Advanced Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Advanced Settings</span>
                </CardTitle>
                <CardDescription>Configure connection pooling and backup settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Pool */}
                <div>
                  <h4 className="font-medium mb-3">Connection Pool</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="poolMin">Minimum Connections</Label>
                      <Input
                        id="poolMin"
                        type="number"
                        value={config.connectionPool.min}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            connectionPool: { ...prev.connectionPool, min: Number(e.target.value) },
                          }))
                        }
                        min="1"
                        className={errors.poolMin ? "border-red-500" : ""}
                      />
                      {errors.poolMin && <p className="text-sm text-red-500 mt-1">{errors.poolMin}</p>}
                    </div>

                    <div>
                      <Label htmlFor="poolMax">Maximum Connections</Label>
                      <Input
                        id="poolMax"
                        type="number"
                        value={config.connectionPool.max}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            connectionPool: { ...prev.connectionPool, max: Number(e.target.value) },
                          }))
                        }
                        min="1"
                        className={errors.poolMax ? "border-red-500" : ""}
                      />
                      {errors.poolMax && <p className="text-sm text-red-500 mt-1">{errors.poolMax}</p>}
                    </div>

                    <div>
                      <Label htmlFor="poolIdle">Idle Timeout (minutes)</Label>
                      <Input
                        id="poolIdle"
                        type="number"
                        value={config.connectionPool.idle}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            connectionPool: { ...prev.connectionPool, idle: Number(e.target.value) },
                          }))
                        }
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Backup Settings */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Switch
                      id="backupEnabled"
                      checked={config.backup.enabled}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, backup: { ...prev.backup, enabled: checked } }))
                      }
                    />
                    <Label htmlFor="backupEnabled" className="font-medium">
                      Enable Automatic Backups
                    </Label>
                  </div>

                  {config.backup.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="backupFreq">Backup Frequency</Label>
                        <Select
                          value={config.backup.frequency}
                          onValueChange={(value) =>
                            setConfig((prev) => ({
                              ...prev,
                              backup: { ...prev.backup, frequency: value as "hourly" | "daily" | "weekly" },
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

                      <div>
                        <Label htmlFor="retention">Retention (days)</Label>
                        <Input
                          id="retention"
                          type="number"
                          value={config.backup.retention}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              backup: { ...prev.backup, retention: Number(e.target.value) },
                            }))
                          }
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading || testResult !== "success"}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Database...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Database
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Configuration Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Configuration Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">NAME</Label>
                <p className="font-medium">{config.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">TYPE</Label>
                <div className="flex items-center space-x-2">
                  <span>{selectedDbType?.icon}</span>
                  <span className="font-medium">{selectedDbType?.label}</span>
                </div>
              </div>
              {config.type !== "sqlite" && (
                <>
                  <div>
                    <Label className="text-xs text-gray-500">HOST</Label>
                    <p className="font-medium font-mono text-sm">{config.host || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">PORT</Label>
                    <p className="font-medium">{config.port || "Not set"}</p>
                  </div>
                </>
              )}
              <div>
                <Label className="text-xs text-gray-500">DATABASE</Label>
                <p className="font-medium font-mono text-sm">{config.database || "Not set"}</p>
              </div>
              {config.ssl && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">SSL Enabled</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help & Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tips & Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Test your connection before saving to ensure proper configuration.</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Use descriptive names and tags to organize your databases effectively.</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Enable SSL/TLS for production databases to ensure secure connections.</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Configure appropriate connection pool limits based on your application needs.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
