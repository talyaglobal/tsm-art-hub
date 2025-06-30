"use client"

import type React from "react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Save,
  Webhook,
  Smartphone,
  Globe,
  Clock,
  TrendingUp,
  Database,
  Server,
  Activity,
} from "lucide-react"

interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  metric: string
  condition: "gt" | "lt" | "eq" | "gte" | "lte"
  threshold: number
  duration: number // minutes
  severity: "low" | "medium" | "high" | "critical"
  channels: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface NotificationChannel {
  id: string
  name: string
  type: "email" | "slack" | "webhook" | "sms" | "teams"
  enabled: boolean
  config: Record<string, any>
  createdAt: string
}

export function AlertConfiguration() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [channels, setChannels] = useState<NotificationChannel[]>([])
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false)
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null)

  useEffect(() => {
    loadAlertRules()
    loadNotificationChannels()
  }, [])

  const loadAlertRules = () => {
    const mockRules: AlertRule[] = [
      {
        id: "1",
        name: "High Error Rate",
        description: "Alert when API error rate exceeds 5%",
        enabled: true,
        metric: "error_rate",
        condition: "gt",
        threshold: 5,
        duration: 5,
        severity: "critical",
        channels: ["email-1", "slack-1"],
        tags: ["api", "errors"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        name: "High Response Time",
        description: "Alert when average response time exceeds 2 seconds",
        enabled: true,
        metric: "avg_response_time",
        condition: "gt",
        threshold: 2000,
        duration: 10,
        severity: "high",
        channels: ["email-1"],
        tags: ["performance"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "3",
        name: "Low API Calls",
        description: "Alert when API calls drop below 100/min",
        enabled: false,
        metric: "api_calls",
        condition: "lt",
        threshold: 100,
        duration: 15,
        severity: "medium",
        channels: ["slack-1"],
        tags: ["volume"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ]
    setAlertRules(mockRules)
  }

  const loadNotificationChannels = () => {
    const mockChannels: NotificationChannel[] = [
      {
        id: "email-1",
        name: "Operations Team Email",
        type: "email",
        enabled: true,
        config: {
          recipients: ["ops@company.com", "alerts@company.com"],
          subject: "TSmart Hub Alert: {{alert.name}}",
        },
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "slack-1",
        name: "Engineering Slack",
        type: "slack",
        enabled: true,
        config: {
          webhookUrl: "https://hooks.slack.com/services/...",
          channel: "#alerts",
          username: "TSmart Hub",
        },
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "webhook-1",
        name: "PagerDuty Webhook",
        type: "webhook",
        enabled: false,
        config: {
          url: "https://events.pagerduty.com/integration/...",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token token=...",
          },
        },
        createdAt: "2024-01-15T10:00:00Z",
      },
    ]
    setChannels(mockChannels)
  }

  const createAlertRule = (rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt">) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAlertRules([...alertRules, newRule])
    setIsCreateRuleOpen(false)
  }

  const updateAlertRule = (id: string, updates: Partial<AlertRule>) => {
    setAlertRules(
      alertRules.map((rule) => (rule.id === id ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule)),
    )
    setEditingRule(null)
  }

  const deleteAlertRule = (id: string) => {
    setAlertRules(alertRules.filter((rule) => rule.id !== id))
  }

  const toggleAlertRule = (id: string) => {
    setAlertRules(alertRules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  const createNotificationChannel = (channel: Omit<NotificationChannel, "id" | "createdAt">) => {
    const newChannel: NotificationChannel = {
      ...channel,
      id: `channel_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setChannels([...channels, newChannel])
    setIsCreateChannelOpen(false)
  }

  const updateNotificationChannel = (id: string, updates: Partial<NotificationChannel>) => {
    setChannels(channels.map((channel) => (channel.id === id ? { ...channel, ...updates } : channel)))
    setEditingChannel(null)
  }

  const deleteNotificationChannel = (id: string) => {
    setChannels(channels.filter((channel) => channel.id !== id))
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "slack":
        return <MessageSquare className="h-4 w-4" />
      case "webhook":
        return <Webhook className="h-4 w-4" />
      case "sms":
        return <Smartphone className="h-4 w-4" />
      case "teams":
        return <Globe className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "error_rate":
        return <AlertTriangle className="h-4 w-4" />
      case "avg_response_time":
        return <Clock className="h-4 w-4" />
      case "api_calls":
        return <TrendingUp className="h-4 w-4" />
      case "cpu_usage":
        return <Server className="h-4 w-4" />
      case "memory_usage":
        return <Database className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Configuration</h2>
          <p className="text-gray-600">Configure alert rules and notification channels</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Notification Channel</DialogTitle>
                <DialogDescription>Configure a new notification channel for alerts</DialogDescription>
              </DialogHeader>
              <NotificationChannelForm
                onSubmit={createNotificationChannel}
                onCancel={() => setIsCreateChannelOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Alert Rule</DialogTitle>
                <DialogDescription>Define conditions and actions for automated alerts</DialogDescription>
              </DialogHeader>
              <AlertRuleForm
                channels={channels}
                onSubmit={createAlertRule}
                onCancel={() => setIsCreateRuleOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>Manage your alert rules and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getMetricIcon(rule.metric)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                            <Switch checked={rule.enabled} onCheckedChange={() => toggleAlertRule(rule.id)} />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              {rule.metric} {rule.condition} {rule.threshold}
                            </span>
                            <span>for {rule.duration} minutes</span>
                            <span>{rule.channels.length} channels</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {rule.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAlertRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure where alerts are sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.map((channel) => (
                  <div key={channel.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel.type)}
                        <h3 className="font-semibold">{channel.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={channel.enabled} onCheckedChange={() => {}} />
                        <Button variant="ghost" size="sm" onClick={() => setEditingChannel(channel)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteNotificationChannel(channel.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="outline" className="mb-2 capitalize">
                      {channel.type}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {channel.type === "email" && <p>{channel.config.recipients?.length || 0} recipients</p>}
                      {channel.type === "slack" && <p>Channel: {channel.config.channel}</p>}
                      {channel.type === "webhook" && <p>URL: {channel.config.url?.substring(0, 30)}...</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Recent alert notifications and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Alert history will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      {editingRule && (
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Alert Rule</DialogTitle>
              <DialogDescription>Modify the alert rule configuration</DialogDescription>
            </DialogHeader>
            <AlertRuleForm
              initialData={editingRule}
              channels={channels}
              onSubmit={(data) => updateAlertRule(editingRule.id, data)}
              onCancel={() => setEditingRule(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Channel Dialog */}
      {editingChannel && (
        <Dialog open={!!editingChannel} onOpenChange={() => setEditingChannel(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notification Channel</DialogTitle>
              <DialogDescription>Modify the notification channel configuration</DialogDescription>
            </DialogHeader>
            <NotificationChannelForm
              initialData={editingChannel}
              onSubmit={(data) => updateNotificationChannel(editingChannel.id, data)}
              onCancel={() => setEditingChannel(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AlertRuleForm({
  initialData,
  channels,
  onSubmit,
  onCancel,
}: {
  initialData?: AlertRule
  channels: NotificationChannel[]
  onSubmit: (data: Omit<AlertRule, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    enabled: initialData?.enabled ?? true,
    metric: initialData?.metric || "error_rate",
    condition: initialData?.condition || "gt",
    threshold: initialData?.threshold || 0,
    duration: initialData?.duration || 5,
    severity: initialData?.severity || "medium",
    channels: initialData?.channels || [],
    tags: initialData?.tags?.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Rule Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="metric">Metric</Label>
          <Select value={formData.metric} onValueChange={(value) => setFormData({ ...formData, metric: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error_rate">Error Rate (%)</SelectItem>
              <SelectItem value="avg_response_time">Avg Response Time (ms)</SelectItem>
              <SelectItem value="api_calls">API Calls per minute</SelectItem>
              <SelectItem value="cpu_usage">CPU Usage (%)</SelectItem>
              <SelectItem value="memory_usage">Memory Usage (%)</SelectItem>
              <SelectItem value="disk_usage">Disk Usage (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gt">Greater than</SelectItem>
              <SelectItem value="gte">Greater than or equal</SelectItem>
              <SelectItem value="lt">Less than</SelectItem>
              <SelectItem value="lte">Less than or equal</SelectItem>
              <SelectItem value="eq">Equal to</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="threshold">Threshold</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Alert will trigger if condition persists for this duration</p>
      </div>

      <div>
        <Label>Notification Channels</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {channels.map((channel) => (
            <label key={channel.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.channels.includes(channel.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, channels: [...formData.channels, channel.id] })
                  } else {
                    setFormData({ ...formData, channels: formData.channels.filter((id) => id !== channel.id) })
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{channel.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="api, performance, critical"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
        />
        <Label>Enable this alert rule</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Rule
        </Button>
      </div>
    </form>
  )
}

function NotificationChannelForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: NotificationChannel
  onSubmit: (data: Omit<NotificationChannel, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "email",
    enabled: initialData?.enabled ?? true,
    config: initialData?.config || {},
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateConfig = (key: string, value: any) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [key]: value },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Channel Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Channel Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="teams">Microsoft Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Email Configuration */}
      {formData.type === "email" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="recipients">Recipients (comma-separated)</Label>
            <Textarea
              id="recipients"
              value={formData.config.recipients?.join(", ") || ""}
              onChange={(e) =>
                updateConfig(
                  "recipients",
                  e.target.value.split(",").map((email) => email.trim()),
                )
              }
              placeholder="admin@company.com, alerts@company.com"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject Template</Label>
            <Input
              id="subject"
              value={formData.config.subject || ""}
              onChange={(e) => updateConfig("subject", e.target.value)}
              placeholder="Alert: {{alert.name}}"
            />
          </div>
        </div>
      )}

      {/* Slack Configuration */}
      {formData.type === "slack" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={formData.config.webhookUrl || ""}
              onChange={(e) => updateConfig("webhookUrl", e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Input
              id="channel"
              value={formData.config.channel || ""}
              onChange={(e) => updateConfig("channel", e.target.value)}
              placeholder="#alerts"
            />
          </div>
          <div>
            <Label htmlFor="username">Bot Username</Label>
            <Input
              id="username"
              value={formData.config.username || ""}
              onChange={(e) => updateConfig("username", e.target.value)}
              placeholder="TSmart Hub"
            />
          </div>
        </div>
      )}

      {/* Webhook Configuration */}
      {formData.type === "webhook" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              value={formData.config.url || ""}
              onChange={(e) => updateConfig("url", e.target.value)}
              placeholder="https://api.example.com/webhooks/alerts"
            />
          </div>
          <div>
            <Label htmlFor="method">HTTP Method</Label>
            <Select value={formData.config.method || "POST"} onValueChange={(value) => updateConfig("method", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={JSON.stringify(formData.config.headers || {}, null, 2)}
              onChange={(e) => {
                try {
                  updateConfig("headers", JSON.parse(e.target.value))
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              rows={3}
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
        />
        <Label>Enable this channel</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Channel
        </Button>
      </div>
    </form>
  )
}
