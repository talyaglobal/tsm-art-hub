"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Shield, Bell, Key, Download, Upload, Save, Edit } from "lucide-react"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  avatar: string
  plan: "basic" | "pro" | "enterprise"
  billingCycle: "monthly" | "yearly"
  nextBilling: string
  usage: {
    apis: number
    requests: number
    storage: number
  }
  limits: {
    apis: number
    requests: number
    storage: number
  }
}

interface NotificationSettings {
  email: {
    alerts: boolean
    reports: boolean
    marketing: boolean
  }
  webhook: {
    enabled: boolean
    url: string
  }
  sms: {
    enabled: boolean
    alerts: boolean
  }
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      // Simulate API calls
      const mockProfile: UserProfile = {
        id: "user_123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 123-4567",
        company: "Acme Corporation",
        jobTitle: "Senior Developer",
        avatar: "/placeholder.svg?height=100&width=100",
        plan: "pro",
        billingCycle: "monthly",
        nextBilling: "2024-02-15",
        usage: {
          apis: 8,
          requests: 45230,
          storage: 2.4,
        },
        limits: {
          apis: 25,
          requests: 100000,
          storage: 10,
        },
      }

      const mockNotifications: NotificationSettings = {
        email: {
          alerts: true,
          reports: true,
          marketing: false,
        },
        webhook: {
          enabled: true,
          url: "https://api.company.com/webhooks/tsmarthub",
        },
        sms: {
          enabled: false,
          alerts: false,
        },
      }

      setProfile(mockProfile)
      setNotifications(mockNotifications)
    } catch (error) {
      console.error("Failed to load account data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveNotifications = async () => {
    if (!notifications) return

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Failed to save notifications:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-gray-100 text-gray-800"
      case "pro":
        return "bg-blue-100 text-blue-800"
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100)
  }

  if (isLoading || !profile || !notifications) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your profile, billing, and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPlanColor(profile.plan)}>
                {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Plan
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal and company information</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => (isEditing ? saveProfile() : setIsEditing(true))}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={profile.avatar || "/placeholder.svg"}
                        alt={`${profile.firstName} ${profile.lastName}`}
                      />
                      <AvatarFallback>
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profile.jobTitle}
                        onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Plan
                      </span>
                      <Badge className={getPlanColor(profile.plan)}>Active</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Billing Cycle: {profile.billingCycle}</p>
                      <p>Next Billing: {profile.nextBilling}</p>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full">Upgrade Plan</Button>
                      <Button variant="outline" className="w-full">
                        Change Billing Cycle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CreditCard className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Update Payment Method
                      </Button>
                      <Button variant="ghost" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoices
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>
                        {profile.usage.apis} / {profile.limits.apis}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${getUsagePercentage(profile.usage.apis, profile.limits.apis)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getUsagePercentage(profile.usage.apis, profile.limits.apis)}% of limit used
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span>
                        {profile.usage.requests.toLocaleString()} / {profile.limits.requests.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${getUsagePercentage(profile.usage.requests, profile.limits.requests)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getUsagePercentage(profile.usage.requests, profile.limits.requests)}% of limit used
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>
                        {profile.usage.storage} GB / {profile.limits.storage} GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${getUsagePercentage(profile.usage.storage, profile.limits.storage)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getUsagePercentage(profile.usage.storage, profile.limits.storage)}% of limit used
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Configure how you receive notifications</CardDescription>
                  </div>
                  <Button onClick={saveNotifications} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="font-medium mb-3">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">System Alerts</p>
                          <p className="text-sm text-gray-600">Get notified about API failures and system issues</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.email.alerts}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, alerts: e.target.checked },
                            })
                          }
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Weekly Reports</p>
                          <p className="text-sm text-gray-600">Receive weekly usage and performance reports</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.email.reports}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, reports: e.target.checked },
                            })
                          }
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Updates</p>
                          <p className="text-sm text-gray-600">Product updates and feature announcements</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.email.marketing}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, marketing: e.target.checked },
                            })
                          }
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Webhook Notifications */}
                  <div>
                    <h4 className="font-medium mb-3">Webhook Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable Webhooks</p>
                          <p className="text-sm text-gray-600">Send notifications to your webhook endpoint</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.webhook.enabled}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              webhook: { ...notifications.webhook, enabled: e.target.checked },
                            })
                          }
                          className="rounded"
                        />
                      </div>
                      {notifications.webhook.enabled && (
                        <div>
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <Input
                            id="webhookUrl"
                            value={notifications.webhook.url}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                webhook: { ...notifications.webhook, url: e.target.value },
                              })
                            }
                            placeholder="https://api.yourapp.com/webhooks"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Password & Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="Enter current password" />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                    <Button className="w-full">Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">2FA Status</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-600">Chrome on macOS • San Francisco, CA</p>
                      <p className="text-xs text-gray-500">Last active: Now</p>
                    </div>
                    <Badge>Current</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-gray-600">iOS App • San Francisco, CA</p>
                      <p className="text-xs text-gray-500">Last active: 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
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
