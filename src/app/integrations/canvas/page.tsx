"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import ReactFlow, {
  type Node,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  ReactFlowProvider,
  Panel,
  type NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

import {
  Play,
  Pause,
  Save,
  Download,
  Upload,
  Settings,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Database,
  Globe,
  Filter,
  Shuffle,
  Layers,
} from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import type { IntegrationFlow, ConnectorDefinition } from "@/types/integration-canvas"

// Custom Node Components
const SourceNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? "border-blue-500" : "border-gray-200"}`}
  >
    <div className="flex items-center">
      <div className="rounded-full w-12 h-12 flex justify-center items-center bg-blue-100">
        <Database className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-2">
        <div className="text-lg font-bold">{data.label}</div>
        <div className="text-gray-500 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
)

const TransformationNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? "border-green-500" : "border-gray-200"}`}
  >
    <div className="flex items-center">
      <div className="rounded-full w-12 h-12 flex justify-center items-center bg-green-100">
        <Shuffle className="w-6 h-6 text-green-600" />
      </div>
      <div className="ml-2">
        <div className="text-lg font-bold">{data.label}</div>
        <div className="text-gray-500 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
)

const DestinationNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? "border-purple-500" : "border-gray-200"}`}
  >
    <div className="flex items-center">
      <div className="rounded-full w-12 h-12 flex justify-center items-center bg-purple-100">
        <Globe className="w-6 h-6 text-purple-600" />
      </div>
      <div className="ml-2">
        <div className="text-lg font-bold">{data.label}</div>
        <div className="text-gray-500 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
)

const FilterNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? "border-yellow-500" : "border-gray-200"}`}
  >
    <div className="flex items-center">
      <div className="rounded-full w-12 h-12 flex justify-center items-center bg-yellow-100">
        <Filter className="w-6 h-6 text-yellow-600" />
      </div>
      <div className="ml-2">
        <div className="text-lg font-bold">{data.label}</div>
        <div className="text-gray-500 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
)

const nodeTypes: NodeTypes = {
  source: SourceNode,
  transformation: TransformationNode,
  destination: DestinationNode,
  filter: FilterNode,
}

// Connector Library Data
const connectorLibrary: ConnectorDefinition[] = [
  {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    description: "Connect to your Shopify store for products, orders, and customers",
    icon: "🛍️",
    version: "1.0.0",
    auth: { type: "api_key", config: {} },
    operations: [
      { id: "get_products", name: "Get Products", type: "read", description: "Fetch products", config: {} },
      { id: "get_orders", name: "Get Orders", type: "read", description: "Fetch orders", config: {} },
    ],
    configSchema: { type: "object", properties: {}, required: [] },
    tags: ["ecommerce", "retail"],
    popular: true,
    verified: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "payment",
    description: "Process payments and manage customer billing",
    icon: "💳",
    version: "1.0.0",
    auth: { type: "api_key", config: {} },
    operations: [
      { id: "get_payments", name: "Get Payments", type: "read", description: "Fetch payments", config: {} },
      { id: "get_customers", name: "Get Customers", type: "read", description: "Fetch customers", config: {} },
    ],
    configSchema: { type: "object", properties: {}, required: [] },
    tags: ["payment", "billing"],
    popular: true,
    verified: true,
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "accounting",
    description: "Sync financial data and accounting records",
    icon: "📊",
    version: "1.0.0",
    auth: { type: "oauth2", config: {} },
    operations: [
      { id: "get_invoices", name: "Get Invoices", type: "read", description: "Fetch invoices", config: {} },
      { id: "get_customers", name: "Get Customers", type: "read", description: "Fetch customers", config: {} },
    ],
    configSchema: { type: "object", properties: {}, required: [] },
    tags: ["accounting", "finance"],
    popular: true,
    verified: true,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Manage leads, opportunities, and customer relationships",
    icon: "☁️",
    version: "1.0.0",
    auth: { type: "oauth2", config: {} },
    operations: [
      { id: "get_leads", name: "Get Leads", type: "read", description: "Fetch leads", config: {} },
      {
        id: "get_opportunities",
        name: "Get Opportunities",
        type: "read",
        description: "Fetch opportunities",
        config: {},
      },
    ],
    configSchema: { type: "object", properties: {}, required: [] },
    tags: ["crm", "sales"],
    popular: true,
    verified: true,
  },
]

export default function IntegrationCanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showConnectorLibrary, setShowConnectorLibrary] = useState(false)
  const [flowName, setFlowName] = useState("Untitled Flow")
  const [isRunning, setIsRunning] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      if (typeof type === "undefined" || !type || !reactFlowBounds) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: `${type} node`,
          description: `New ${type} node`,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const addConnectorNode = (connector: ConnectorDefinition) => {
    const newNode: Node = {
      id: `${connector.id}-${Date.now()}`,
      type: "source",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: connector.name,
        description: connector.description,
        connector: connector,
      },
    }
    setNodes((nds) => nds.concat(newNode))
    setShowConnectorLibrary(false)
  }

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }
  }

  const duplicateSelectedNode = () => {
    if (selectedNode) {
      const newNode: Node = {
        ...selectedNode,
        id: `${selectedNode.id}-copy-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
        selected: false,
      }
      setNodes((nds) => nds.concat(newNode))
    }
  }

  const runFlow = async () => {
    setIsRunning(true)
    // Simulate flow execution
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsRunning(false)
  }

  const saveFlow = () => {
    const flow: Partial<IntegrationFlow> = {
      name: flowName,
      canvas: {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type as any,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    }
    console.log("Saving flow:", flow)
    // TODO: Save to backend
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto"
          />
          <Badge variant="outline">Draft</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowMiniMap(!showMiniMap)}>
            {showMiniMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            MiniMap
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            <Layers className="h-4 w-4" />
            Grid
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={saveFlow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={runFlow} disabled={isRunning}>
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Flow
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <Tabs defaultValue="connectors" className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connectors">Connectors</TabsTrigger>
              <TabsTrigger value="transforms">Transform</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="connectors" className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <Label>Data Sources</Label>
                <div className="grid grid-cols-2 gap-2">
                  {connectorLibrary
                    .filter((c) => ["ecommerce", "payment", "accounting", "crm"].includes(c.category))
                    .map((connector) => (
                      <Card
                        key={connector.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addConnectorNode(connector)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl mb-1">{connector.icon}</div>
                          <div className="text-sm font-medium">{connector.name}</div>
                          <div className="text-xs text-gray-500">{connector.category}</div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transformations</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { type: "transformation", label: "Map Fields", icon: "🔄" },
                    { type: "filter", label: "Filter Data", icon: "🔍" },
                    { type: "aggregation", label: "Aggregate", icon: "📊" },
                    { type: "join", label: "Join Data", icon: "🔗" },
                  ].map((item) => (
                    <Card
                      key={item.type}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("application/reactflow", item.type)
                        event.dataTransfer.effectAllowed = "move"
                      }}
                    >
                      <CardContent className="p-3 flex items-center space-x-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destinations</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "destination", label: "Database", icon: "🗄️" },
                    { type: "destination", label: "Webhook", icon: "🔗" },
                    { type: "destination", label: "Email", icon: "📧" },
                    { type: "destination", label: "File", icon: "📁" },
                  ].map((item, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("application/reactflow", item.type)
                        event.dataTransfer.effectAllowed = "move"
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-lg mb-1">{item.icon}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transforms" className="flex-1 p-4 space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Field Mapping</CardTitle>
                    <CardDescription>Map fields between source and destination</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex space-x-2">
                      <Input placeholder="Source field" />
                      <span className="flex items-center">→</span>
                      <Input placeholder="Target field" />
                    </div>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Mapping
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Filters</CardTitle>
                    <CardDescription>Filter records based on conditions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="not_equals">Not equals</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Value" />
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Aggregations</CardTitle>
                    <CardDescription>Aggregate data with functions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Function" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Field to aggregate" />
                    <Input placeholder="Group by field (optional)" />
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Aggregation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="flex-1 p-4 space-y-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Node Properties</h3>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={duplicateSelectedNode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={deleteSelectedNode}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="node-name">Name</Label>
                        <Input
                          id="node-name"
                          value={selectedNode.data.label}
                          onChange={(e) => {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNode.id
                                  ? { ...node, data: { ...node.data, label: e.target.value } }
                                  : node,
                              ),
                            )
                            setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value } })
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="node-description">Description</Label>
                        <Textarea
                          id="node-description"
                          value={selectedNode.data.description || ""}
                          onChange={(e) => {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNode.id
                                  ? { ...node, data: { ...node.data, description: e.target.value } }
                                  : node,
                              ),
                            )
                            setSelectedNode({
                              ...selectedNode,
                              data: { ...selectedNode.data, description: e.target.value },
                            })
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {selectedNode.type === "source" && selectedNode.data.connector && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Connector Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Connector</Label>
                          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <span className="text-lg">{selectedNode.data.connector.icon}</span>
                            <div>
                              <div className="font-medium">{selectedNode.data.connector.name}</div>
                              <div className="text-sm text-gray-500">{selectedNode.data.connector.description}</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="api-key">API Key</Label>
                          <Input id="api-key" type="password" placeholder="Enter API key" />
                        </div>
                        <div>
                          <Label htmlFor="endpoint">Endpoint URL</Label>
                          <Input id="endpoint" placeholder="https://api.example.com" />
                        </div>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Test Connection
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.type === "transformation" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Transformation Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Transformation Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transformation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="map_fields">Map Fields</SelectItem>
                              <SelectItem value="filter_records">Filter Records</SelectItem>
                              <SelectItem value="aggregate">Aggregate Data</SelectItem>
                              <SelectItem value="format">Format Data</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="transformation-script">Custom Script</Label>
                          <Textarea
                            id="transformation-script"
                            placeholder="// JavaScript transformation code"
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="error-handling" />
                          <Label htmlFor="error-handling">Continue on error</Label>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.type === "filter" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Filter Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Filter Conditions</Label>
                          <div className="space-y-2">
                            <div className="flex space-x-2">
                              <Input placeholder="Field name" className="flex-1" />
                              <Select>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="eq">Equals</SelectItem>
                                  <SelectItem value="ne">Not equals</SelectItem>
                                  <SelectItem value="gt">Greater than</SelectItem>
                                  <SelectItem value="lt">Less than</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input placeholder="Value" className="flex-1" />
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full bg-transparent">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Condition
                          </Button>
                        </div>
                        <div>
                          <Label>Logic Operator</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="AND" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="and">AND</SelectItem>
                              <SelectItem value="or">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.type === "destination" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Destination Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Destination Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="database">Database</SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                              <SelectItem value="api">API Endpoint</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="destination-url">URL/Connection String</Label>
                          <Input id="destination-url" placeholder="Enter destination URL" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="batch-processing" />
                          <Label htmlFor="batch-processing">Batch processing</Label>
                        </div>
                        <div>
                          <Label htmlFor="batch-size">Batch Size</Label>
                          <Input id="batch-size" type="number" placeholder="100" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a node to view its properties</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <div className="w-full h-full" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="top-right"
              >
                <Controls />
                {showMiniMap && <MiniMap />}
                {showGrid && <Background variant="dots" gap={12} size={1} />}

                <Panel position="top-left">
                  <Card className="w-64">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Flow Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Nodes:</span>
                        <span className="font-medium">{nodes.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Connections:</span>
                        <span className="font-medium">{edges.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "Running" : "Ready"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Panel>

                {nodes.length === 0 && (
                  <Panel position="top-center">
                    <Card className="w-96">
                      <CardContent className="text-center py-8">
                        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Start Building Your Integration</h3>
                        <p className="text-gray-600 mb-4">
                          Drag connectors from the sidebar to create your first data flow
                        </p>
                        <Button onClick={() => setShowConnectorLibrary(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Connector
                        </Button>
                      </CardContent>
                    </Card>
                  </Panel>
                )}
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Connector Library Dialog */}
      <Dialog open={showConnectorLibrary} onOpenChange={setShowConnectorLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connector Library</DialogTitle>
            <DialogDescription>
              Choose from our library of pre-built connectors to integrate with popular platforms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex space-x-4">
              <Input placeholder="Search connectors..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="accounting">Accounting</SelectItem>
                  <SelectItem value="crm">CRM</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectorLibrary.map((connector) => (
                <Card key={connector.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{connector.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{connector.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {connector.category}
                            </Badge>
                            {connector.verified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            {connector.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{connector.description}</CardDescription>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Operations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {connector.operations.slice(0, 3).map((op) => (
                            <Badge key={op.id} variant="outline" className="text-xs">
                              {op.name}
                            </Badge>
                          ))}
                          {connector.operations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{connector.operations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Auth:</span> {connector.auth.type}
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={() => addConnectorNode(connector)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Flow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
