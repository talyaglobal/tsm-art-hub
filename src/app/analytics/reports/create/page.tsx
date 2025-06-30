"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, BarChart3, Users, Database, TrendingUp, FileText, Eye, Save, Play } from "lucide-react"

interface ReportConfig {
  name: string
  description: string
  type: "performance" | "usage" | "security" | "financial" | ""
  frequency: "on-demand" | "daily" | "weekly" | "monthly" | ""
  format: "pdf" | "excel" | "csv" | "json"
  dataSources: string[]
  dateRange: {
    type: "last-7-days" | "last-30-days" | "last-90-days" | "custom"
    startDate?: string
    endDate?: string
  }
  metrics: string[]
  filters: Record<string, any>
  recipients: string[]
  autoSend: boolean
}

export default function CreateReportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<ReportConfig>({
    name: "",
    description: "",
    type: "",
    frequency: "",
    format: "pdf",
    dataSources: [],
    dateRange: { type: "last-30-days" },
    metrics: [],
    filters: {},
    recipients: [],
    autoSend: false,
  })

  const reportTypes = [
    {
      id: "performance",
      name: "Performance Report",
      description: "API response times, throughput, and error rates",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-blue-600",
      metrics: ["Response Time", "Throughput", "Error Rate", "Uptime", "Latency", "Success Rate"],
    },
    {
      id: "usage",
      name: "Usage Analytics",
      description: "User behavior, engagement, and retention metrics",
      icon: <Users className="h-5 w-5" />,
      color: "text-green-600",
      metrics: ["Active Users", "API Calls", "Data Transfer", "Feature Usage", "User Sessions", "Retention Rate"],
    },
    {
      id: "security",
      name: "Security Audit",
      description: "Security events, vulnerabilities, and compliance",
      icon: <Database className="h-5 w-5" />,
      color: "text-red-600",
      metrics: [
        "Security Events",
        "Failed Logins",
        "Threat Detection",
        "Compliance Score",
        "Vulnerabilities",
        "Access Logs",
      ],
    },
    {
      id: "financial",
      name: "Financial Report",
      description: "Revenue, costs, and business metrics",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-600",
      metrics: ["Revenue", "API Usage Costs", "Subscription Revenue", "Churn Rate", "Customer LTV", "Growth Rate"],
    },
  ]

  const dataSources = [
    { id: "api-gateway", name: "API Gateway Logs", description: "Request/response logs from API gateway" },
    { id: "user-analytics", name: "User Analytics", description: "User behavior and engagement data" },
    { id: "security-logs", name: "Security Logs", description: "Authentication and security events" },
    { id: "billing-data", name: "Billing Data", description: "Subscription and payment information" },
    { id: "performance-metrics", name: "Performance Metrics", description: "System performance and monitoring data" },
    { id: "error-logs", name: "Error Logs", description: "Application errors and exceptions" },
  ]

  const handleTypeSelect = (type: string) => {
    const selectedType = reportTypes.find((t) => t.id === type)
    setConfig((prev) => ({
      ...prev,
      type: type as any,
      metrics: selectedType ? selectedType.metrics : [],
    }))
  }

  const handleMetricToggle = (metric: string) => {
    setConfig((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metric) ? prev.metrics.filter((m) => m !== metric) : [...prev.metrics, metric],
    }))
  }

  const handleDataSourceToggle = (sourceId: string) => {
    setConfig((prev) => ({
      ...prev,
      dataSources: prev.dataSources.includes(sourceId)
        ? prev.dataSources.filter((s) => s !== sourceId)
        : [...prev.dataSources, sourceId],
    }))
  }

  const handleSave = () => {
    // Save as draft
    console.log("Saving report config:", config)
    router.push("/analytics/reports")
  }

  const handleGenerate = () => {
    // Generate report immediately
    console.log("Generating report:", config)
    router.push("/analytics/reports")
  }

  const selectedReportType = reportTypes.find((t) => t.id === config.type)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Report</h1>
            <p className="text-gray-600">Build a custom analytics report with your preferred metrics and schedule</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleGenerate} disabled={!config.name || !config.type}>
            <Play className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="data">Data & Metrics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Format</TabsTrigger>
          <TabsTrigger value="preview">Preview & Generate</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
              <CardDescription>Basic details about your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter report name"
                    value={config.name}
                    onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Output Format</Label>
                  <Select
                    value={config.format}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, format: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this report will contain and its purpose"
                  value={config.description}
                  onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Type</CardTitle>
              <CardDescription>Choose the type of report you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      config.type === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={type.color}>{type.icon}</div>
                      <h4 className="font-medium">{type.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Metrics */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Select the data sources to include in your report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSources.map((source) => (
                  <div key={source.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={source.id}
                      checked={config.dataSources.includes(source.id)}
                      onCheckedChange={() => handleDataSourceToggle(source.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={source.id} className="font-medium cursor-pointer">
                        {source.name}
                      </Label>
                      <p className="text-sm text-gray-600">{source.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedReportType && (
            <Card>
              <CardHeader>
                <CardTitle>Metrics & KPIs</CardTitle>
                <CardDescription>
                  Choose which metrics to include in your {selectedReportType.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedReportType.metrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={config.metrics.includes(metric)}
                        onCheckedChange={() => handleMetricToggle(metric)}
                      />
                      <Label htmlFor={metric} className="cursor-pointer">
                        {metric}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Specify the time period for your report data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={config.dateRange.type}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, type: value as any },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {config.dateRange.type === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={config.dateRange.startDate || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, startDate: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={config.dateRange.endDate || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, endDate: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule & Format */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Schedule</CardTitle>
              <CardDescription>Set up automatic report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Generation Frequency</Label>
                <Select
                  value={config.frequency}
                  onValueChange={(value) => setConfig((prev) => ({ ...prev, frequency: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-demand">On Demand Only</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-send"
                  checked={config.autoSend}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, autoSend: checked }))}
                />
                <Label htmlFor="auto-send">Automatically send to recipients</Label>
              </div>

              {config.autoSend && (
                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  <Textarea
                    placeholder="Enter email addresses separated by commas"
                    value={config.recipients.join(", ")}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        recipients: e.target.value
                          .split(",")
                          .map((email) => email.trim())
                          .filter(Boolean),
                      }))
                    }
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & Generate */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
              <CardDescription>Review your report configuration before generating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Report Name</Label>
                    <p className="font-medium">{config.name || "Untitled Report"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <p className="font-medium capitalize">{config.type || "Not selected"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Format</Label>
                    <p className="font-medium uppercase">{config.format}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Frequency</Label>
                    <p className="font-medium capitalize">{config.frequency || "Not set"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data Sources</Label>
                    <p className="font-medium">{config.dataSources.length} selected</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Metrics</Label>
                    <p className="font-medium">{config.metrics.length} selected</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date Range</Label>
                    <p className="font-medium capitalize">{config.dateRange.type.replace("-", " ")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Auto Send</Label>
                    <p className="font-medium">{config.autoSend ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>

              {config.metrics.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Selected Metrics</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.metrics.map((metric) => (
                      <Badge key={metric} variant="secondary">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Report Preview</h3>
                  <p className="text-gray-600 mb-4">Preview will be available after generating the report</p>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
