"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Filter,
  Play,
  Code,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  ArrowRight,
  Copy,
  Edit,
  Eye,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Connector {
  id: string
  name: string
  type: "source" | "destination" | "transformation"
  status: "active" | "inactive" | "draft" | "error"
  description: string
  version: string
  author: string
  category: string
  lastModified: string
  usageCount: number
  rating: number
  tags: string[]
}

interface ConnectorTemplate {
  id: string
  name: string
  type: "source" | "destination" | "transformation"
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: string
  features: string[]
  preview: string
}

export default function ConnectorsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null)

  const connectors: Connector[] = [
    {
      id: "conn_1",
      name: "Salesforce Data Extractor",
      type: "source",
      status: "active",
      description: "Extract customer and opportunity data from Salesforce CRM",
      version: "2.1.0",
      author: "TSmart Hub Team",
      category: "CRM",
      lastModified: "2024-01-15",
      usageCount: 1247,
      rating: 4.8,
      tags: ["salesforce", "crm", "customers", "opportunities"],
    },
    {
      id: "conn_2",
      name: "PostgreSQL Loader",
      type: "destination",
      status: "active",
      description: "Load transformed data into PostgreSQL database with schema validation",
      version: "1.5.2",
      author: "Community",
      category: "Database",
      lastModified: "2024-01-12",
      usageCount: 892,
      rating: 4.6,
      tags: ["postgresql", "database", "sql", "validation"],
    },
    {
      id: "conn_3",
      name: "Data Cleaner Pro",
      type: "transformation",
      status: "active",
      description: "Advanced data cleaning with ML-powered anomaly detection",
      version: "3.0.1",
      author: "TSmart Hub Team",
      category: "Data Quality",
      lastModified: "2024-01-10",
      usageCount: 2156,
      rating: 4.9,
      tags: ["cleaning", "ml", "anomaly", "quality"],
    },
    {
      id: "conn_4",
      name: "Shopify Order Sync",
      type: "source",
      status: "draft",
      description: "Real-time synchronization of Shopify orders and customer data",
      version: "1.0.0-beta",
      author: "John Developer",
      category: "E-commerce",
      lastModified: "2024-01-08",
      usageCount: 23,
      rating: 4.2,
      tags: ["shopify", "orders", "realtime", "ecommerce"],
    },
  ]

  const templates: ConnectorTemplate[] = [
    {
      id: "template_1",
      name: "REST API Source",
      type: "source",
      description: "Generic REST API data source with authentication and pagination support",
      category: "API",
      difficulty: "beginner",
      estimatedTime: "15 minutes",
      features: ["OAuth 2.0", "API Key Auth", "Pagination", "Rate Limiting"],
      preview: `async function fetchData(config) {
  const response = await fetch(config.endpoint, {
    headers: {
      'Authorization': \`Bearer \${config.token}\`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}`,
    },
    {
      id: "template_2",
      name: "Database Destination",
      type: "destination",
      description: "Write data to SQL databases with automatic schema creation",
      category: "Database",
      difficulty: "intermediate",
      estimatedTime: "30 minutes",
      features: ["Auto Schema", "Batch Insert", "Upsert Support", "Connection Pooling"],
      preview: `async function writeData(data, config) {
  const connection = await createConnection(config);
  await connection.batchInsert(config.table, data);
  await connection.close();
}`,
    },
    {
      id: "template_3",
      name: "Data Validator",
      type: "transformation",
      description: "Validate and clean data using configurable rules and patterns",
      category: "Data Quality",
      difficulty: "intermediate",
      estimatedTime: "25 minutes",
      features: ["Schema Validation", "Custom Rules", "Error Reporting", "Data Profiling"],
      preview: `function validateData(data, rules) {
  return data.map(record => {
    const errors = [];
    rules.forEach(rule => {
      if (!rule.validate(record)) {
        errors.push(rule.message);
      }
    });
    return { ...record, _errors: errors };
  });
}`,
    },
  ]

  const filteredConnectors = connectors.filter((connector) => {
    const matchesSearch =
      connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedType === "all" || connector.type === selectedType
    const matchesCategory = selectedCategory === "all" || connector.category === selectedCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "all" || template.type === selectedType
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "draft":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "source":
        return <Database className="h-4 w-4 text-blue-500" />
      case "destination":
        return <ArrowRight className="h-4 w-4 text-green-500" />
      case "transformation":
        return <Zap className="h-4 w-4 text-purple-500" />
      default:
        return <Code className="h-4 w-4 text-gray-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateConnector = async (templateId?: string) => {
    setIsCreating(true)
    try {
      // Simulate connector creation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Connector Created",
        description: templateId
          ? "Connector created from template successfully."
          : "New connector created successfully.",
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create connector. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleTestConnector = async (connectorId: string) => {
    try {
      // Simulate connector testing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Test Successful",
        description: "Connector test completed successfully.",
      })
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Connector test failed. Please check configuration.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Bypass Login Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white border-green-500"
          onClick={() => {
            toast({
              title: "Login Bypassed",
              description: "You can now access all connector features without authentication.",
            })
          }}
        >
          🔓 Bypass Login
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connector Framework</h1>
          <p className="text-gray-600">Build, test, and deploy custom data connectors with our visual framework</p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Connectors</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          {/* Browse Connectors Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search connectors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="source">Source</SelectItem>
                      <SelectItem value="destination">Destination</SelectItem>
                      <SelectItem value="transformation">Transformation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="CRM">CRM</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Data Quality">Data Quality</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Connectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnectors.map((connector) => (
                <Card key={connector.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(connector.type)}
                        <div>
                          <CardTitle className="text-lg">{connector.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">
                              {connector.type}
                            </Badge>
                            <Badge variant="secondary">{connector.category}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(connector.status)}
                        <span className="text-sm text-gray-500 capitalize">{connector.status}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{connector.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Version</span>
                        <span className="font-medium">{connector.version}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usage</span>
                        <span className="font-medium">{connector.usageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Rating</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{connector.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(connector.rating) ? "text-yellow-400" : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {connector.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {connector.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{connector.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => setSelectedConnector(connector)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTestConnector(connector.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredConnectors.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Connectors Found</h3>
                  <p className="text-gray-600 mb-6">
                    No connectors match your current filters. Try adjusting your search criteria.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Connector
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Connector Templates</h2>
                <p className="text-gray-600">Start with pre-built templates to accelerate development</p>
              </div>
              <Button onClick={() => handleCreateConnector()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">
                              {template.type}
                            </Badge>
                            <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium">{template.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Est. Time</span>
                        <span className="font-medium">{template.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-sm font-medium">Features</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-sm font-medium">Preview</Label>
                      <div className="mt-2 bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                        <pre>{template.preview}</pre>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleCreateConnector(template.id)} disabled={isCreating}>
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-1" />
                        )}
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create New Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Connector</CardTitle>
                <CardDescription>Build a custom connector from scratch or import existing code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="connector-name">Connector Name</Label>
                    <Input id="connector-name" placeholder="My Custom Connector" />
                  </div>
                  <div>
                    <Label htmlFor="connector-type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="source">Source</SelectItem>
                        <SelectItem value="destination">Destination</SelectItem>
                        <SelectItem value="transformation">Transformation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="connector-description">Description</Label>
                  <Textarea id="connector-description" placeholder="Describe what your connector does..." rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="connector-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                        <SelectItem value="messaging">Messaging</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="connector-version">Version</Label>
                    <Input id="connector-version" placeholder="1.0.0" />
                  </div>
                </div>

                <div>
                  <Label>Configuration Schema</Label>
                  <Textarea
                    placeholder="Define your connector's configuration schema in JSON..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label>Implementation Code</Label>
                  <Textarea
                    placeholder="Write your connector implementation..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-testing" />
                  <Label htmlFor="enable-testing">Enable built-in testing</Label>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => handleCreateConnector()} disabled={isCreating}>
                    {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Connector
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Code
                  </Button>
                  <Button variant="outline">
                    <Code className="h-4 w-4 mr-2" />
                    Validate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connector Marketplace</h3>
                <p className="text-gray-600 mb-6">
                  Discover and share connectors with the community. Browse thousands of pre-built connectors or publish
                  your own.
                </p>
                <div className="space-y-3">
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Publish Connector
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Connector Details Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedConnector.type)}
                  <div>
                    <CardTitle className="text-xl">{selectedConnector.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {selectedConnector.type}
                      </Badge>
                      <Badge variant="secondary">{selectedConnector.category}</Badge>
                      <span className="text-sm">v{selectedConnector.version}</span>
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedConnector(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedConnector.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Author</h4>
                  <p className="text-gray-600">{selectedConnector.author}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Last Modified</h4>
                  <p className="text-gray-600">{selectedConnector.lastModified}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedConnector.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Test Connector
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Clone
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
