"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Webhook, Plus, Settings, CheckCircle, XCircle, Clock, Send, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackButton } from "@/components/ui/back-button"

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  status: "active" | "inactive" | "failed"
  lastTriggered: string
  successRate: number
  totalDeliveries: number
  failedDeliveries: number
  secret: string
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
  }
}

interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  status: "success" | "failed" | "pending"
  timestamp: string
  responseCode: number
  responseTime: number
  payload: any
  error?: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret: "",
  })

  const availableEvents = [
    "integration.created",
    "integration.updated",
    "integration.deleted",
    "data.synced",
    "data.failed",
    "alert.triggered",
    "user.created",
    "user.updated",
  ]

  useEffect(() => {
    loadWebhooks()
    loadDeliveries()
  }, [])

  const loadWebhooks = async () => {
    try {
      // Simulate API call
      const mockWebhooks: WebhookEndpoint[] = [
        {
          id: "1",
          name: "Production Notifications",
          url: "https://api.myapp.com/webhooks/tsmarthub",
          events: ["integration.created", "data.synced", "alert.triggered"],
          status: "active",
          lastTriggered: "2 minutes ago",
          successRate: 98.5,
          totalDeliveries: 1247,
          failedDeliveries: 18,
          secret: "whsec_1234567890abcdef",
          retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
          },
        },
        {
          id: "2",
          name: "Development Testing",
          url: "https://webhook.site/unique-id",
          events: ["data.synced", "data.failed"],
          status: "active",
          lastTriggered: "1 hour ago",
          successRate: 100,
          totalDeliveries: 89,
          failedDeliveries: 0,
          secret: "whsec_abcdef1234567890",
          retryPolicy: {
            maxRetries: 1,
            backoffMultiplier: 1,
          },
        },
        {
          id: "3",
          name: "Legacy Integration",
          url: "https://old-system.company.com/webhook",
          events: ["user.created", "user.updated"],
          status: "failed",
          lastTriggered: "2 days ago",
          successRate: 45.2,
          totalDeliveries: 156,
          failedDeliveries: 85,
          secret: "whsec_legacy123456",
          retryPolicy: {
            maxRetries: 5,
            backoffMultiplier: 3,
          },
        },
      ]
      setWebhooks(mockWebhooks)
    } catch (error) {
      console.error("Failed to load webhooks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDeliveries = async () => {
    try {
      // Simulate API call
      const mockDeliveries: WebhookDelivery[] = [
        {
          id: "1",
          webhookId: "1",
          event: "data.synced",
          status: "success",
          timestamp: "2024-01-20T14:30:00Z",
          responseCode: 200,
          responseTime: 145,
          payload: { integration_id: "shopify_001", records_synced: 150 },
        },
        {
          id: "2",
          webhookId: "1",
          event: "alert.triggered",
          status: "success",
          timestamp: "2024-01-20T14:25:00Z",
          responseCode: 200,
          responseTime: 89,
          payload: { alert_type: "high_response_time", api_id: "stripe_001" },
        },
        {
          id: "3",
          webhookId: "3",
          event: "user.created",
          status: "failed",
          timestamp: "2024-01-20T14:20:00Z",
          responseCode: 500,
          responseTime: 5000,
          payload: { user_id: "user_123", email: "test@example.com" },
          error: "Internal Server Error",
        },
      ]
      setDeliveries(mockDeliveries)
    } catch (error) {
      console.error("Failed to load deliveries:", error)
    }
  }

  const createWebhook = async () => {
    try {
      const webhook: WebhookEndpoint = {
        id: Date.now().toString(),
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        status: "active",
        lastTriggered: "Never",
        successRate: 0,
        totalDeliveries: 0,
        failedDeliveries: 0,
        secret: newWebhook.secret || `whsec_${Math.random().toString(36).substr(2, 16)}`,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
        },
      }

      setWebhooks([webhook, ...webhooks])
      setShowCreateDialog(false)
      setNewWebhook({ name: "", url: "", events: [], secret: "" })
    } catch (error) {
      console.error("Failed to create webhook:", error)
    }
  }

  const testWebhook = async (webhookId: string) => {
    try {
      // Simulate webhook test
      const testPayload = {
        event: "webhook.test",
        timestamp: new Date().toISOString(),
        data: { test: true },
      }

      console.log("Testing webhook:", webhookId, testPayload)
      // In real implementation, this would send a test payload to the webhook URL
    } catch (error) {
      console.error("Failed to test webhook:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading webhooks...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
              <p className="text-gray-600">Manage webhook endpoints and event notifications</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Webhook Endpoint</DialogTitle>
                  <DialogDescription>Configure a new webhook to receive event notifications</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhookName">Webhook Name</Label>
                    <Input
                      id="webhookName"
                      placeholder="Production Notifications"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhookUrl">Endpoint URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://api.yourapp.com/webhooks/tsmarthub"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Events to Subscribe</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableEvents.map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] })
                              } else {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: newWebhook.events.filter((e) => e !== event),
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhookSecret"
                      placeholder="Leave empty to auto-generate"
                      value={newWebhook.secret}
                      onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                    />
                  </div>
                  <Button
                    onClick={createWebhook}
                    className="w-full"
                    disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                  >
                    Create Webhook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
            <TabsTrigger value="events">Event Types</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Webhook className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">{webhook.url}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(webhook.status)}>
                        {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => testWebhook(webhook.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Events */}
                    <div>
                      <Label className="text-sm font-medium">Subscribed Events</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Success Rate</Label>
                        <p className="text-lg font-semibold text-green-600">{webhook.successRate}%</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Total Deliveries</Label>
                        <p className="text-lg font-semibold">{webhook.totalDeliveries}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Failed Deliveries</Label>
                        <p className="text-lg font-semibold text-red-600">{webhook.failedDeliveries}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Last Triggered</Label>
                        <p className="text-sm font-medium">{webhook.lastTriggered}</p>
                      </div>
                    </div>

                    {/* Secret */}
                    <div>
                      <Label className="text-sm font-medium">Webhook Secret</Label>
                      <Input value={webhook.secret} readOnly className="font-mono text-sm mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Deliveries</CardTitle>
                <CardDescription>Latest webhook delivery attempts and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(delivery.status)}
                        <div>
                          <p className="font-medium">{delivery.event}</p>
                          <p className="text-sm text-gray-600">{new Date(delivery.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge variant={delivery.status === "success" ? "default" : "destructive"}>
                          {delivery.responseCode}
                        </Badge>
                        <span>{delivery.responseTime}ms</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Event Types</CardTitle>
                <CardDescription>Events that can trigger webhook notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableEvents.map((event) => (
                    <div key={event} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{event}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {event === "integration.created" && "Triggered when a new integration is created"}
                        {event === "integration.updated" && "Triggered when an integration is modified"}
                        {event === "integration.deleted" && "Triggered when an integration is removed"}
                        {event === "data.synced" && "Triggered when data synchronization completes successfully"}
                        {event === "data.failed" && "Triggered when data synchronization fails"}
                        {event === "alert.triggered" && "Triggered when a system alert is generated"}
                        {event === "user.created" && "Triggered when a new user account is created"}
                        {event === "user.updated" && "Triggered when user account information is updated"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
