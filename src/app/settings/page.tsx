"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Building2,
  Shield,
  Bell,
  Plug,
  CreditCard,
  Cog,
  Save,
  RefreshCw,
  Mail,
  Webhook,
  Database,
  Server,
  AlertTriangle,
  Upload,
  Download,
} from "lucide-react"
import { BackButton } from "@/components/ui/back-button"

interface GeneralSettings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  timezone: string
  dateFormat: string
  language: string
  currency: string
}

interface ApiSettings {
  globalRateLimit: number
  rateLimitWindow: string
  maxConnections: number
  requestTimeout: number
  enableCors: boolean
  allowedOrigins: string[]
  defaultApiVersion: string
  enableApiKeys: boolean
}

interface SecuritySettings {
  requireTwoFactor: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  requirePasswordComplexity: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  enableAuditLogging: boolean
}

interface NotificationSettings {
  emailNotifications: {
    systemAlerts: boolean
    apiFailures: boolean
    usageThresholds: boolean
    securityEvents: boolean
    weeklyReports: boolean
  }
  webhookNotifications: {
    enabled: boolean
    url: string
    events: string[]
  }
  smsNotifications: {
    enabled: boolean
    phoneNumber: string
    criticalOnly: boolean
  }
}

interface IntegrationSettings {
  supabase: {
    enabled: boolean
    url: string
    anonKey: string
  }
  stripe: {
    enabled: boolean
    publishableKey: string
    webhookSecret: string
  }
  sendgrid: {
    enabled: boolean
    apiKey: string
    fromEmail: string
  }
  slack: {
    enabled: boolean
    webhookUrl: string
    channel: string
  }
}

interface BillingSettings {
  plan: "basic" | "pro" | "enterprise"
  billingCycle: "monthly" | "yearly"
  autoRenew: boolean
  usageAlerts: {
    enabled: boolean
    threshold: number
  }
  invoiceEmail: string
}

interface AdvancedSettings {
  enableDebugMode: boolean
  logLevel: "error" | "warn" | "info" | "debug"
  cacheEnabled: boolean
  cacheTtl: number
  enableMetrics: boolean
  metricsRetention: number
  backupEnabled: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
}

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null)
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings | null>(null)
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null)
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Simulate API calls to load settings
      const mockGeneralSettings: GeneralSettings = {
        companyName: "TSmartHub Inc.",
        companyEmail: "admin@tsmarthub.com",
        companyPhone: "+1 (555) 123-4567",
        companyAddress: "123 Tech Street, San Francisco, CA 94105",
        timezone: "America/Los_Angeles",
        dateFormat: "MM/DD/YYYY",
        language: "en",
        currency: "USD",
      }

      const mockApiSettings: ApiSettings = {
        globalRateLimit: 1000,
        rateLimitWindow: "hour",
        maxConnections: 100,
        requestTimeout: 30,
        enableCors: true,
        allowedOrigins: ["https://app.tsmarthub.com", "https://dashboard.tsmarthub.com"],
        defaultApiVersion: "v1",
        enableApiKeys: true,
      }

      const mockSecuritySettings: SecuritySettings = {
        requireTwoFactor: true,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requirePasswordComplexity: true,
        enableIpWhitelist: false,
        allowedIps: [],
        enableAuditLogging: true,
      }

      const mockNotificationSettings: NotificationSettings = {
        emailNotifications: {
          systemAlerts: true,
          apiFailures: true,
          usageThresholds: true,
          securityEvents: true,
          weeklyReports: false,
        },
        webhookNotifications: {
          enabled: true,
          url: "https://api.company.com/webhooks/tsmarthub",
          events: ["api.failure", "security.breach", "usage.threshold"],
        },
        smsNotifications: {
          enabled: false,
          phoneNumber: "",
          criticalOnly: true,
        },
      }

      const mockIntegrationSettings: IntegrationSettings = {
        supabase: {
          enabled: true,
          url: "https://your-project.supabase.co",
          anonKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        },
        stripe: {
          enabled: true,
          publishableKey: "pk_test_...",
          webhookSecret: "whsec_...",
        },
        sendgrid: {
          enabled: false,
          apiKey: "",
          fromEmail: "",
        },
        slack: {
          enabled: false,
          webhookUrl: "",
          channel: "#alerts",
        },
      }

      const mockBillingSettings: BillingSettings = {
        plan: "pro",
        billingCycle: "monthly",
        autoRenew: true,
        usageAlerts: {
          enabled: true,
          threshold: 80,
        },
        invoiceEmail: "billing@tsmarthub.com",
      }

      const mockAdvancedSettings: AdvancedSettings = {
        enableDebugMode: false,
        logLevel: "info",
        cacheEnabled: true,
        cacheTtl: 3600,
        enableMetrics: true,
        metricsRetention: 30,
        backupEnabled: true,
        backupFrequency: "daily",
      }

      setGeneralSettings(mockGeneralSettings)
      setApiSettings(mockApiSettings)
      setSecuritySettings(mockSecuritySettings)
      setNotificationSettings(mockNotificationSettings)
      setIntegrationSettings(mockIntegrationSettings)
      setBillingSettings(mockBillingSettings)
      setAdvancedSettings(mockAdvancedSettings)
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (section: string) => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`Saving ${section} settings...`)
    } catch (error) {
      console.error(`Failed to save ${section} settings:`, error)
    } finally {
      setIsSaving(false)
    }
  }

  const exportSettings = () => {
    const allSettings = {
      general: generalSettings,
      api: apiSettings,
      security: securitySettings,
      notifications: notificationSettings,
      integrations: integrationSettings,
      billing: billingSettings,
      advanced: advancedSettings,
    }

    const dataStr = JSON.stringify(allSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "tsmarthub-settings.json"
    link.click()
  }

  if (isLoading) {
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
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Configure your platform preferences and integrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <Cog className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Company Information
                    </CardTitle>
                    <CardDescription>Basic company details and contact information</CardDescription>
                  </div>
                  <Button onClick={() => saveSettings("general")} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {generalSettings && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={generalSettings.companyName}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyEmail">Company Email</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={generalSettings.companyEmail}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, companyEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyPhone">Phone Number</Label>
                        <Input
                          id="companyPhone"
                          value={generalSettings.companyPhone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, companyPhone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyAddress">Address</Label>
                        <Textarea
                          id="companyAddress"
                          value={generalSettings.companyAddress}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, companyAddress: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={generalSettings.timezone}
                          onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select
                          value={generalSettings.dateFormat}
                          onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={generalSettings.language}
                          onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={generalSettings.currency}
                          onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Server className="h-5 w-5 mr-2" />
                      API Configuration
                    </CardTitle>
                    <CardDescription>Configure API rate limits, CORS, and authentication settings</CardDescription>
                  </div>
                  <Button onClick={() => saveSettings("api")} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {apiSettings && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="globalRateLimit">Global Rate Limit</Label>
                          <Input
                            id="globalRateLimit"
                            type="number"
                            value={apiSettings.globalRateLimit}
                            onChange={(e) =>
                              setApiSettings({ ...apiSettings, globalRateLimit: Number.parseInt(e.target.value) })
                            }
                          />
                          <p className="text-sm text-gray-600 mt-1">Requests per hour</p>
                        </div>
                        <div>
                          <Label htmlFor="maxConnections">Max Connections</Label>
                          <Input
                            id="maxConnections"
                            type="number"
                            value={apiSettings.maxConnections}
                            onChange={(e) =>
                              setApiSettings({ ...apiSettings, maxConnections: Number.parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="requestTimeout">Request Timeout (seconds)</Label>
                          <Input
                            id="requestTimeout"
                            type="number"
                            value={apiSettings.requestTimeout}
                            onChange={(e) =>
                              setApiSettings({ ...apiSettings, requestTimeout: Number.parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="defaultApiVersion">Default API Version</Label>
                          <Select
                            value={apiSettings.defaultApiVersion}
                            onValueChange={(value) => setApiSettings({ ...apiSettings, defaultApiVersion: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="v1">v1</SelectItem>
                              <SelectItem value="v2">v2</SelectItem>
                              <SelectItem value="v3">v3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable CORS</Label>
                            <p className="text-sm text-gray-600">Allow cross-origin requests</p>
                          </div>
                          <Switch
                            checked={apiSettings.enableCors}
                            onCheckedChange={(checked) => setApiSettings({ ...apiSettings, enableCors: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable API Keys</Label>
                            <p className="text-sm text-gray-600">Require API keys for authentication</p>
                          </div>
                          <Switch
                            checked={apiSettings.enableApiKeys}
                            onCheckedChange={(checked) => setApiSettings({ ...apiSettings, enableApiKeys: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Allowed Origins</Label>
                      <p className="text-sm text-gray-600 mb-2">Domains allowed to make CORS requests</p>
                      <div className="space-y-2">
                        {apiSettings.allowedOrigins.map((origin, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={origin}
                              onChange={(e) => {
                                const newOrigins = [...apiSettings.allowedOrigins]
                                newOrigins[index] = e.target.value
                                setApiSettings({ ...apiSettings, allowedOrigins: newOrigins })
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOrigins = apiSettings.allowedOrigins.filter((_, i) => i !== index)
                                setApiSettings({ ...apiSettings, allowedOrigins: newOrigins })
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() =>
                            setApiSettings({ ...apiSettings, allowedOrigins: [...apiSettings.allowedOrigins, ""] })
                          }
                        >
                          Add Origin
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Security Configuration
                    </CardTitle>
                    <CardDescription>Manage authentication, session, and security policies</CardDescription>
                  </div>
                  <Button onClick={() => saveSettings("security")} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {securitySettings && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-600">Force 2FA for all users</p>
                          </div>
                          <Switch
                            checked={securitySettings.requireTwoFactor}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, requireTwoFactor: checked })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            value={securitySettings.sessionTimeout}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                sessionTimeout: Number.parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                          <Input
                            id="maxLoginAttempts"
                            type="number"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                maxLoginAttempts: Number.parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                          <Input
                            id="passwordMinLength"
                            type="number"
                            value={securitySettings.passwordMinLength}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                passwordMinLength: Number.parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Password Complexity</Label>
                            <p className="text-sm text-gray-600">Uppercase, lowercase, numbers, symbols</p>
                          </div>
                          <Switch
                            checked={securitySettings.requirePasswordComplexity}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, requirePasswordComplexity: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Audit Logging</Label>
                            <p className="text-sm text-gray-600">Log all security events</p>
                          </div>
                          <Switch
                            checked={securitySettings.enableAuditLogging}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, enableAuditLogging: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label>IP Whitelist</Label>
                          <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
                        </div>
                        <Switch
                          checked={securitySettings.enableIpWhitelist}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({ ...securitySettings, enableIpWhitelist: checked })
                          }
                        />
                      </div>

                      {securitySettings.enableIpWhitelist && (
                        <div className="space-y-2">
                          {securitySettings.allowedIps.map((ip, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={ip}
                                placeholder="192.168.1.1"
                                onChange={(e) => {
                                  const newIps = [...securitySettings.allowedIps]
                                  newIps[index] = e.target.value
                                  setSecuritySettings({ ...securitySettings, allowedIps: newIps })
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newIps = securitySettings.allowedIps.filter((_, i) => i !== index)
                                  setSecuritySettings({ ...securitySettings, allowedIps: newIps })
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() =>
                              setSecuritySettings({
                                ...securitySettings,
                                allowedIps: [...securitySettings.allowedIps, ""],
                              })
                            }
                          >
                            Add IP Address
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notificationSettings && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>System Alerts</Label>
                          <p className="text-sm text-gray-600">Critical system notifications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications.systemAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: { ...notificationSettings.emailNotifications, systemAlerts: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>API Failures</Label>
                          <p className="text-sm text-gray-600">API endpoint failures and errors</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications.apiFailures}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: { ...notificationSettings.emailNotifications, apiFailures: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Usage Thresholds</Label>
                          <p className="text-sm text-gray-600">When usage limits are reached</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications.usageThresholds}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: {
                                ...notificationSettings.emailNotifications,
                                usageThresholds: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Security Events</Label>
                          <p className="text-sm text-gray-600">Login attempts and security issues</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications.securityEvents}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: {
                                ...notificationSettings.emailNotifications,
                                securityEvents: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Weekly Reports</Label>
                          <p className="text-sm text-gray-600">Weekly usage and performance reports</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications.weeklyReports}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: {
                                ...notificationSettings.emailNotifications,
                                weeklyReports: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Webhook className="h-5 w-5 mr-2" />
                    Webhook Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notificationSettings && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Webhooks</Label>
                          <p className="text-sm text-gray-600">Send notifications to webhook endpoint</p>
                        </div>
                        <Switch
                          checked={notificationSettings.webhookNotifications.enabled}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              webhookNotifications: { ...notificationSettings.webhookNotifications, enabled: checked },
                            })
                          }
                        />
                      </div>

                      {notificationSettings.webhookNotifications.enabled && (
                        <>
                          <div>
                            <Label htmlFor="webhookUrl">Webhook URL</Label>
                            <Input
                              id="webhookUrl"
                              value={notificationSettings.webhookNotifications.url}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  webhookNotifications: {
                                    ...notificationSettings.webhookNotifications,
                                    url: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://api.yourapp.com/webhooks"
                            />
                          </div>

                          <div>
                            <Label>Event Types</Label>
                            <div className="mt-2 space-y-2">
                              {["api.failure", "security.breach", "usage.threshold", "system.alert"].map((event) => (
                                <div key={event} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={event}
                                    checked={notificationSettings.webhookNotifications.events.includes(event)}
                                    onChange={(e) => {
                                      const events = e.target.checked
                                        ? [...notificationSettings.webhookNotifications.events, event]
                                        : notificationSettings.webhookNotifications.events.filter((e) => e !== event)
                                      setNotificationSettings({
                                        ...notificationSettings,
                                        webhookNotifications: { ...notificationSettings.webhookNotifications, events },
                                      })
                                    }}
                                    className="rounded"
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => saveSettings("notifications")} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Settings
              </Button>
            </div>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrationSettings &&
                Object.entries(integrationSettings).map(([key, integration]) => (
                  <Card key={key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center capitalize">
                          <Database className="h-5 w-5 mr-2" />
                          {key}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={integration.enabled ? "default" : "secondary"}>
                            {integration.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Switch
                            checked={integration.enabled}
                            onCheckedChange={(checked) =>
                              setIntegrationSettings({
                                ...integrationSettings,
                                [key]: { ...integration, enabled: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {integration.enabled && (
                        <div className="space-y-3">
                          {Object.entries(integration)
                            .filter(([k]) => k !== "enabled")
                            .map(([field, value]) => (
                              <div key={field}>
                                <Label htmlFor={`${key}-${field}`} className="capitalize">
                                  {field.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                <Input
                                  id={`${key}-${field}`}
                                  type={field.includes("key") || field.includes("secret") ? "password" : "text"}
                                  value={value as string}
                                  onChange={(e) =>
                                    setIntegrationSettings({
                                      ...integrationSettings,
                                      [key]: { ...integration, [field]: e.target.value },
                                    })
                                  }
                                  placeholder={`Enter ${field}`}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => saveSettings("integrations")} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Integration Settings
              </Button>
            </div>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Subscription Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billingSettings && (
                    <div className="space-y-4">
                      <div>
                        <Label>Current Plan</Label>
                        <div className="mt-2">
                          <Badge className="text-lg px-3 py-1">
                            {billingSettings.plan.charAt(0).toUpperCase() + billingSettings.plan.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label>Billing Cycle</Label>
                        <Select
                          value={billingSettings.billingCycle}
                          onValueChange={(value: "monthly" | "yearly") =>
                            setBillingSettings({ ...billingSettings, billingCycle: value })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Renewal</Label>
                          <p className="text-sm text-gray-600">Automatically renew subscription</p>
                        </div>
                        <Switch
                          checked={billingSettings.autoRenew}
                          onCheckedChange={(checked) => setBillingSettings({ ...billingSettings, autoRenew: checked })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="invoiceEmail">Invoice Email</Label>
                        <Input
                          id="invoiceEmail"
                          type="email"
                          value={billingSettings.invoiceEmail}
                          onChange={(e) => setBillingSettings({ ...billingSettings, invoiceEmail: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Usage Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billingSettings && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Usage Alerts</Label>
                          <p className="text-sm text-gray-600">Get notified when approaching limits</p>
                        </div>
                        <Switch
                          checked={billingSettings.usageAlerts.enabled}
                          onCheckedChange={(checked) =>
                            setBillingSettings({
                              ...billingSettings,
                              usageAlerts: { ...billingSettings.usageAlerts, enabled: checked },
                            })
                          }
                        />
                      </div>

                      {billingSettings.usageAlerts.enabled && (
                        <div>
                          <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                          <Input
                            id="alertThreshold"
                            type="number"
                            min="1"
                            max="100"
                            value={billingSettings.usageAlerts.threshold}
                            onChange={(e) =>
                              setBillingSettings({
                                ...billingSettings,
                                usageAlerts: {
                                  ...billingSettings.usageAlerts,
                                  threshold: Number.parseInt(e.target.value),
                                },
                              })
                            }
                            className="mt-2"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Alert when usage reaches {billingSettings.usageAlerts.threshold}% of limit
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoices
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => saveSettings("billing")} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Billing Settings
              </Button>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Cog className="h-5 w-5 mr-2" />
                      Advanced Configuration
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2 mt-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span>These settings can affect system performance and stability</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Button onClick={() => saveSettings("advanced")} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {advancedSettings && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Debug Mode</Label>
                            <p className="text-sm text-gray-600">Enable detailed logging and debugging</p>
                          </div>
                          <Switch
                            checked={advancedSettings.enableDebugMode}
                            onCheckedChange={(checked) =>
                              setAdvancedSettings({ ...advancedSettings, enableDebugMode: checked })
                            }
                          />
                        </div>

                        <div>
                          <Label>Log Level</Label>
                          <Select
                            value={advancedSettings.logLevel}
                            onValueChange={(value: "error" | "warn" | "info" | "debug") =>
                              setAdvancedSettings({ ...advancedSettings, logLevel: value })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Caching</Label>
                            <p className="text-sm text-gray-600">Cache API responses for better performance</p>
                          </div>
                          <Switch
                            checked={advancedSettings.cacheEnabled}
                            onCheckedChange={(checked) =>
                              setAdvancedSettings({ ...advancedSettings, cacheEnabled: checked })
                            }
                          />
                        </div>

                        {advancedSettings.cacheEnabled && (
                          <div>
                            <Label htmlFor="cacheTtl">Cache TTL (seconds)</Label>
                            <Input
                              id="cacheTtl"
                              type="number"
                              value={advancedSettings.cacheTtl}
                              onChange={(e) =>
                                setAdvancedSettings({ ...advancedSettings, cacheTtl: Number.parseInt(e.target.value) })
                              }
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Metrics</Label>
                            <p className="text-sm text-gray-600">Collect performance and usage metrics</p>
                          </div>
                          <Switch
                            checked={advancedSettings.enableMetrics}
                            onCheckedChange={(checked) =>
                              setAdvancedSettings({ ...advancedSettings, enableMetrics: checked })
                            }
                          />
                        </div>

                        {advancedSettings.enableMetrics && (
                          <div>
                            <Label htmlFor="metricsRetention">Metrics Retention (days)</Label>
                            <Input
                              id="metricsRetention"
                              type="number"
                              value={advancedSettings.metricsRetention}
                              onChange={(e) =>
                                setAdvancedSettings({
                                  ...advancedSettings,
                                  metricsRetention: Number.parseInt(e.target.value),
                                })
                              }
                              className="mt-2"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Backups</Label>
                            <p className="text-sm text-gray-600">Automatic data backups</p>
                          </div>
                          <Switch
                            checked={advancedSettings.backupEnabled}
                            onCheckedChange={(checked) =>
                              setAdvancedSettings({ ...advancedSettings, backupEnabled: checked })
                            }
                          />
                        </div>

                        {advancedSettings.backupEnabled && (
                          <div>
                            <Label>Backup Frequency</Label>
                            <Select
                              value={advancedSettings.backupFrequency}
                              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                                setAdvancedSettings({ ...advancedSettings, backupFrequency: value })
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
