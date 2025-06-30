"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Play, Pause, Settings, Eye, GitBranch, Filter, Merge, Database, Zap, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface DataPipeline {
  id: string
  name: string
  description: string
  sourceIntegrations: string[]
  transformations: any[]
  status: "active" | "paused" | "error"
  metrics: {
    recordsProcessed: number
    successRate: number
    avgProcessingTime: number
    lastRunAt?: string
  }
  schedule: {
    type: "realtime" | "scheduled"
    frequency?: string
  }
}

interface Integration {
  id: string
  name: string
  type: string
  provider: string
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<DataPipeline[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load pipelines
      const pipelinesResponse = await fetch("/api/gateway/pipelines")
      if (pipelinesResponse.ok) {
        const data = await pipelinesResponse.json()
        setPipelines(data.data.pipelines || [])
      }

      // Load integrations for pipeline creation
      const integrationsResponse = await fetch("/api/gateway/integrations")
      if (integrationsResponse.ok) {
        const data = await integrationsResponse.json()
        setIntegrations(data.data.integrations || [])
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load data:", error)
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransformationIcon = (type: string) => {
    switch (type) {
      case "merge":
        return <Merge className="h-4 w-4" />
      case "filter":
        return <Filter className="h-4 w-4" />
      case "aggregate":
        return <Database className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data pipelines...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Data Pipelines</h1>
              <p className="text-gray-600">Transform and route your data across integrations</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Data Pipeline</DialogTitle>
                  <DialogDescription>
                    Build automated data transformations and routing between your integrations
                  </DialogDescription>
                </DialogHeader>
                <PipelineBuilder
                  integrations={integrations}
                  onComplete={(pipeline) => {
                    setShowCreateDialog(false)
                    loadData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipelines</CardTitle>
              <GitBranch className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelines.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                {pipelines.filter((p) => p.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pipelines.reduce((sum, p) => sum + p.metrics.recordsProcessed, 0).toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pipelines.length > 0
                  ? Math.round((pipelines.reduce((sum, p) => sum + p.metrics.successRate, 0) / pipelines.length) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-600 mt-1">Average across all pipelines</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pipelines.length > 0
                  ? Math.round(pipelines.reduce((sum, p) => sum + p.metrics.avgProcessingTime, 0) / pipelines.length)
                  : 0}
                ms
              </div>
              <p className="text-xs text-gray-600 mt-1">Per record</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipelines List */}
        <div className="space-y-6">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <GitBranch className="h-5 w-5 text-blue-600" />
                      <span>{pipeline.name}</span>
                      <Badge className={getStatusColor(pipeline.status)}>{pipeline.status}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{pipeline.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      {pipeline.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pipeline Flow Visualization */}
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {/* Source Integrations */}
                    <div className="flex flex-col items-center space-y-2 min-w-0">
                      <div className="text-xs font-medium text-gray-500">Sources</div>
                      <div className="flex space-x-2">
                        {pipeline.sourceIntegrations.slice(0, 3).map((sourceId, index) => {
                          const integration = integrations.find((i) => i.id === sourceId)
                          return (
                            <div
                              key={index}
                              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                            >
                              <Database className="h-4 w-4 text-blue-600" />
                            </div>
                          )
                        })}
                        {pipeline.sourceIntegrations.length > 3 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs">+{pipeline.sourceIntegrations.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">→</div>

                    {/* Transformations */}
                    <div className="flex flex-col items-center space-y-2 min-w-0">
                      <div className="text-xs font-medium text-gray-500">Transformations</div>
                      <div className="flex space-x-2">
                        {pipeline.transformations.slice(0, 3).map((transform, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                          >
                            {getTransformationIcon(transform.type)}
                          </div>
                        ))}
                        {pipeline.transformations.length > 3 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs">+{pipeline.transformations.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">→</div>

                    {/* Output */}
                    <div className="flex flex-col items-center space-y-2 min-w-0">
                      <div className="text-xs font-medium text-gray-500">Output</div>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Database className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{pipeline.metrics.recordsProcessed.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Records Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{Math.round(pipeline.metrics.successRate * 100)}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{pipeline.metrics.avgProcessingTime}ms</div>
                      <div className="text-xs text-gray-500">Avg Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {pipeline.schedule.type === "realtime" ? "Real-time" : pipeline.schedule.frequency}
                      </div>
                      <div className="text-xs text-gray-500">Schedule</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pipelines.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pipelines yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first data pipeline to start transforming and routing data between integrations
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Pipeline
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Pipeline Builder Component
function PipelineBuilder({
  integrations,
  onComplete,
}: {
  integrations: Integration[]
  onComplete: (pipeline: any) => void
}) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    name: "",
    description: "",
    sourceIntegrations: [] as string[],
    transformations: [] as any[],
    schedule: { type: "realtime" as const },
  })

  const handleComplete = async () => {
    try {
      const response = await fetch("/api/gateway/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        onComplete(config)
      }
    } catch (error) {
      console.error("Failed to create pipeline:", error)
    }
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Pipeline Name</Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Customer Data Sync Pipeline"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this pipeline does..."
          />
        </div>

        <div>
          <Label>Source Integrations</Label>
          <div className="space-y-2 mt-2">
            {integrations.map((integration) => (
              <label key={integration.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.sourceIntegrations.includes(integration.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig((prev) => ({
                        ...prev,
                        sourceIntegrations: [...prev.sourceIntegrations, integration.id],
                      }))
                    } else {
                      setConfig((prev) => ({
                        ...prev,
                        sourceIntegrations: prev.sourceIntegrations.filter((id) => id !== integration.id),
                      }))
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">
                  {integration.name} ({integration.type})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setStep(2)} disabled={!config.name || config.sourceIntegrations.length === 0}>
            Next: Configure Transformations
          </Button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Configure Transformations</h3>
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Schedule Type</Label>
            <Select
              value={config.schedule.type}
              onValueChange={(value: "realtime" | "scheduled") =>
                setConfig((prev) => ({ ...prev, schedule: { type: value } }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Transformations (Optional)</Label>
            <p className="text-sm text-gray-600 mb-2">Add data transformations to clean, merge, or enrich your data</p>
            <Button
              variant="outline"
              onClick={() => {
                setConfig((prev) => ({
                  ...prev,
                  transformations: [
                    ...prev.transformations,
                    { type: "merge", config: {}, order: prev.transformations.length },
                  ],
                }))
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transformation
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={handleComplete}>Create Pipeline</Button>
        </div>
      </div>
    )
  }

  return null
}
