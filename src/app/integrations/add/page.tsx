"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  ArrowLeft,
  Globe,
  Calculator,
  CreditCard,
  Package,
  Database,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Code,
  Zap,
  Settings,
  TestTube,
  Loader2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface IntegrationTemplate {
  id: string
  name: string
  description: string
  type: string
  provider: string
  tags: string[]
  popular: boolean
  difficulty: "easy" | "medium" | "advanced"
  estimatedTime: string
  features: string[]
  documentation: string
  config: {
    endpoints: Record<string, string>
    authentication: {
      type: string
      fields: Array<{
        name: string
        label: string
        type: string
        required: boolean
        placeholder?: string
        description?: string
      }>
    }
    dataMapping: Record<string, any>
  }
}

export default function AddIntegrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"browse" | "configure" | "test" | "complete">("browse")
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [showCustom, setShowCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const [config, setConfig] = useState({
    name: "",
    description: "",
    endpoint: "",
    authType: "api_key",
    credentials: {} as Record<string, any>,
    syncFrequency: "daily",
    enableWebhooks: false,
    webhookUrl: "",
    dataMapping: {} as Record<string, any>,
    customHeaders: {} as Record<string, string>,
  })

  const [templates] = useState<IntegrationTemplate[]>([
    {
      id: "shopify",
      name: "Shopify",
      description: "Connect your Shopify store to sync products, orders, customers, and inventory data",
      type: "ecommerce",
      provider: "shopify",
      tags: ["ecommerce", "retail", "popular", "inventory"],
      popular: true,
      difficulty: "easy",
      estimatedTime: "5 minutes",
      features: ["Product sync", "Order management", "Customer data", "Inventory tracking", "Real-time webhooks"],
      documentation: "https://shopify.dev/api/admin-rest",
      config: {
        endpoints: {
          products: "/admin/api/2023-10/products.json",
          orders: "/admin/api/2023-10/orders.json",
          customers: "/admin/api/2023-10/customers.json",
        },
        authentication: {
          type: "api_key",
          fields: [
            {
              name: "shop_domain",
              label: "Shop Domain",
              type: "text",
              required: true,
              placeholder: "mystore.myshopify.com",
              description: "Your Shopify store domain",
            },
            {
              name: "access_token",
              label: "Access Token",
              type: "password",
              required: true,
              placeholder: "shpat_...",
              description: "Private app access token from Shopify admin",
            },
          ],
        },
        dataMapping: {
          products: {
            id: "id",
            title: "title",
            price: "variants[0].price",
            inventory: "variants[0].inventory_quantity",
          },
        },
      },
    },
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      description: "Integrate with QuickBooks for comprehensive accounting and financial data management",
      type: "accounting",
      provider: "quickbooks",
      tags: ["accounting", "finance", "popular", "invoicing"],
      popular: true,
      difficulty: "medium",
      estimatedTime: "10 minutes",
      features: [
        "Financial reporting",
        "Invoice management",
        "Customer billing",
        "Tax calculations",
        "Bank reconciliation",
      ],
      documentation: "https://developer.intuit.com/app/developer/qbo/docs/api/accounting",
      config: {
        endpoints: {
          companies: "/v3/companyinfo",
          customers: "/v3/customers",
          items: "/v3/items",
          invoices: "/v3/invoices",
        },
        authentication: {
          type: "oauth2",
          fields: [
            {
              name: "client_id",
              label: "Client ID",
              type: "text",
              required: true,
              placeholder: "Q0...",
              description: "OAuth 2.0 Client ID from Intuit Developer",
            },
            {
              name: "client_secret",
              label: "Client Secret",
              type: "password",
              required: true,
              placeholder: "...",
              description: "OAuth 2.0 Client Secret",
            },
            {
              name: "company_id",
              label: "Company ID",
              type: "text",
              required: true,
              placeholder: "123456789",
              description: "QuickBooks Company ID",
            },
          ],
        },
        dataMapping: {
          customers: {
            id: "Id",
            name: "Name",
            email: "PrimaryEmailAddr.Address",
          },
        },
      },
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Connect Stripe for payment processing, subscription management, and financial analytics",
      type: "payment",
      provider: "stripe",
      tags: ["payment", "finance", "popular", "subscriptions"],
      popular: true,
      difficulty: "easy",
      estimatedTime: "3 minutes",
      features: [
        "Payment processing",
        "Subscription management",
        "Customer analytics",
        "Dispute handling",
        "Payout tracking",
      ],
      documentation: "https://stripe.com/docs/api",
      config: {
        endpoints: {
          charges: "/v1/charges",
          customers: "/v1/customers",
          subscriptions: "/v1/subscriptions",
          invoices: "/v1/invoices",
        },
        authentication: {
          type: "bearer_token",
          fields: [
            {
              name: "secret_key",
              label: "Secret Key",
              type: "password",
              required: true,
              placeholder: "sk_live_... or sk_test_...",
              description: "Stripe secret key from your dashboard",
            },
          ],
        },
        dataMapping: {
          charges: {
            id: "id",
            amount: "amount",
            currency: "currency",
            status: "status",
          },
        },
      },
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      description: "Integrate with WooCommerce stores for product and order synchronization",
      type: "ecommerce",
      provider: "woocommerce",
      tags: ["ecommerce", "wordpress", "open-source"],
      popular: false,
      difficulty: "medium",
      estimatedTime: "8 minutes",
      features: [
        "Product catalog",
        "Order processing",
        "Customer management",
        "Coupon tracking",
        "Shipping integration",
      ],
      documentation: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
      config: {
        endpoints: {
          products: "/wp-json/wc/v3/products",
          orders: "/wp-json/wc/v3/orders",
          customers: "/wp-json/wc/v3/customers",
        },
        authentication: {
          type: "basic_auth",
          fields: [
            {
              name: "site_url",
              label: "Site URL",
              type: "text",
              required: true,
              placeholder: "https://mystore.com",
              description: "Your WooCommerce site URL",
            },
            {
              name: "consumer_key",
              label: "Consumer Key",
              type: "text",
              required: true,
              placeholder: "ck_...",
              description: "WooCommerce API consumer key",
            },
            {
              name: "consumer_secret",
              label: "Consumer Secret",
              type: "password",
              required: true,
              placeholder: "cs_...",
              description: "WooCommerce API consumer secret",
            },
          ],
        },
        dataMapping: {
          products: {
            id: "id",
            name: "name",
            price: "price",
            stock: "stock_quantity",
          },
        },
      },
    },
    {
      id: "xero",
      name: "Xero",
      description: "Connect Xero for accounting, invoicing, and financial reporting",
      type: "accounting",
      provider: "xero",
      tags: ["accounting", "finance", "invoicing"],
      popular: false,
      difficulty: "medium",
      estimatedTime: "12 minutes",
      features: [
        "Accounting automation",
        "Invoice management",
        "Expense tracking",
        "Financial reporting",
        "Bank feeds",
      ],
      documentation: "https://developer.xero.com/documentation/api/accounting/overview",
      config: {
        endpoints: {
          contacts: "/api.xro/2.0/Contacts",
          invoices: "/api.xro/2.0/Invoices",
          items: "/api.xro/2.0/Items",
        },
        authentication: {
          type: "oauth2",
          fields: [
            {
              name: "client_id",
              label: "Client ID",
              type: "text",
              required: true,
              placeholder: "...",
              description: "Xero OAuth 2.0 Client ID",
            },
            {
              name: "client_secret",
              label: "Client Secret",
              type: "password",
              required: true,
              placeholder: "...",
              description: "Xero OAuth 2.0 Client Secret",
            },
          ],
        },
        dataMapping: {},
      },
    },
    {
      id: "square",
      name: "Square",
      description: "Integrate Square for point-of-sale, payment processing, and inventory management",
      type: "payment",
      provider: "square",
      tags: ["payment", "pos", "inventory"],
      popular: false,
      difficulty: "medium",
      estimatedTime: "10 minutes",
      features: ["POS integration", "Payment processing", "Inventory sync", "Customer profiles", "Analytics"],
      documentation: "https://developer.squareup.com/docs",
      config: {
        endpoints: {
          payments: "/v2/payments",
          customers: "/v2/customers",
          catalog: "/v2/catalog/list",
        },
        authentication: {
          type: "bearer_token",
          fields: [
            {
              name: "access_token",
              label: "Access Token",
              type: "password",
              required: true,
              placeholder: "EAA...",
              description: "Square application access token",
            },
            {
              name: "application_id",
              label: "Application ID",
              type: "text",
              required: true,
              placeholder: "sq0idp-...",
              description: "Square application ID",
            },
          ],
        },
        dataMapping: {},
      },
    },
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ecommerce":
        return <Globe className="h-5 w-5" />
      case "accounting":
        return <Calculator className="h-5 w-5" />
      case "payment":
        return <CreditCard className="h-5 w-5" />
      case "warehouse":
        return <Package className="h-5 w-5" />
      case "banking":
        return <Database className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || template.type === filterType
    const matchesDifficulty = filterDifficulty === "all" || template.difficulty === filterDifficulty

    return matchesSearch && matchesType && matchesDifficulty
  })

  const handleTemplateSelect = (template: IntegrationTemplate) => {
    setSelectedTemplate(template)
    setConfig((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      endpoint: `https://api.${template.provider}.com`,
      authType: template.config.authentication.type,
    }))
    setCurrentStep("configure")
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock test result
      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResult({
        success,
        message: success ? "Connection successful!" : "Connection failed. Please check your credentials.",
        details: success
          ? {
              responseTime: Math.floor(Math.random() * 200) + 50,
              endpoints: ["✓ Products", "✓ Orders", "✓ Customers"],
            }
          : {
              error: "Invalid API credentials",
              statusCode: 401,
            },
      })

      if (success) {
        setTimeout(() => setCurrentStep("complete"), 1500)
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Test failed due to network error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateIntegration = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/gateway/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config.name,
          type: selectedTemplate?.type || "custom",
          provider: selectedTemplate?.provider || "custom",
          config: {
            endpoint: config.endpoint,
            authentication: {
              type: config.authType,
              credentials: config.credentials,
            },
            syncFrequency: config.syncFrequency,
            enableWebhooks: config.enableWebhooks,
            webhookUrl: config.webhookUrl,
            dataMapping: config.dataMapping,
            customHeaders: config.customHeaders,
          },
        }),
      })

      if (response.ok) {
        router.push("/integrations?success=true")
      } else {
        throw new Error("Failed to create integration")
      }
    } catch (error) {
      console.error("Failed to create integration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/integrations">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Integrations
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Integration</h1>
                <p className="text-gray-600">Connect a new data source to your API gateway</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Step{" "}
                {currentStep === "browse"
                  ? "1"
                  : currentStep === "configure"
                    ? "2"
                    : currentStep === "test"
                      ? "3"
                      : "4"}{" "}
                of 4
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: "browse", label: "Browse", icon: Search },
              { key: "configure", label: "Configure", icon: Settings },
              { key: "test", label: "Test", icon: TestTube },
              { key: "complete", label: "Complete", icon: CheckCircle },
            ].map((step, index) => {
              const isActive = currentStep === step.key
              const isCompleted =
                (currentStep === "configure" && step.key === "browse") ||
                (currentStep === "test" && ["browse", "configure"].includes(step.key)) ||
                (currentStep === "complete" && ["browse", "configure", "test"].includes(step.key))

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isCompleted
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < 3 && <div className={`w-16 h-0.5 ml-4 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "browse" && (
          <div className="space-y-6">
            {/* AI Suggestions */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Based on your current setup, we recommend these integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">QuickBooks Online</h4>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Perfect for syncing financial data with your e-commerce platform
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(templates.find((t) => t.id === "quickbooks")!)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Setup
                    </Button>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Stripe Payments</h4>
                      <Badge className="bg-green-100 text-green-800 text-xs">Popular</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integrate payment processing and subscription management
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTemplateSelect(templates.find((t) => t.id === "stripe")!)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browse Options */}
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Pre-built Integrations</TabsTrigger>
                <TabsTrigger value="custom">Custom API</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Browse Integrations</CardTitle>
                    <CardDescription>Choose from our library of pre-built integrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search integrations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="accounting">Accounting</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Integration Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                {getTypeIcon(template.type)}
                                <div>
                                  <CardTitle className="text-lg">{template.name}</CardTitle>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {template.popular && (
                                      <Badge variant="secondary" className="text-xs">
                                        Popular
                                      </Badge>
                                    )}
                                    <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                                      {template.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Setup time:</span>
                                <span className="font-medium">{template.estimatedTime}</span>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                                <div className="space-y-1">
                                  {template.features.slice(0, 3).map((feature, index) => (
                                    <div key={index} className="flex items-center text-xs text-gray-600">
                                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                      {feature}
                                    </div>
                                  ))}
                                  {template.features.length > 3 && (
                                    <p className="text-xs text-gray-500">
                                      +{template.features.length - 3} more features
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-2">
                                {template.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                        <Button variant="outline" onClick={() => setSearchTerm("")}>
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      Custom API Integration
                    </CardTitle>
                    <CardDescription>Create a custom integration for APIs not in our template library</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customName">Integration Name</Label>
                        <Input
                          id="customName"
                          placeholder="My Custom API"
                          value={config.name}
                          onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customDescription">Description</Label>
                        <Textarea
                          id="customDescription"
                          placeholder="Describe what this integration does..."
                          value={config.description}
                          onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customEndpoint">API Base URL</Label>
                        <Input
                          id="customEndpoint"
                          placeholder="https://api.example.com"
                          value={config.endpoint}
                          onChange={(e) => setConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                        />
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedTemplate(null)
                          setShowCustom(true)
                          setCurrentStep("configure")
                        }}
                        disabled={!config.name || !config.endpoint}
                        className="w-full"
                      >
                        Continue with Custom Integration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentStep === "configure" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {selectedTemplate ? getTypeIcon(selectedTemplate.type) : <Code className="h-5 w-5" />}
                    <span className="ml-2">Configure {selectedTemplate?.name || "Custom API"}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate
                      ? `Set up your ${selectedTemplate.name} integration`
                      : "Configure your custom API connection"}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setCurrentStep("browse")}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Integration Name</Label>
                      <Input
                        id="name"
                        value={config.name}
                        onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="My Store Integration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endpoint">API Endpoint</Label>
                      <Input
                        id="endpoint"
                        value={config.endpoint}
                        onChange={(e) => setConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this integration..."
                    />
                  </div>
                </div>

                {/* Authentication */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Authentication</h3>
                  <div>
                    <Label htmlFor="authType">Authentication Type</Label>
                    <Select
                      value={config.authType}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, authType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="bearer_token">Bearer Token</SelectItem>
                        <SelectItem value="basic_auth">Basic Authentication</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Authentication Fields */}
                  {selectedTemplate?.config.authentication.fields ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.config.authentication.fields.map((field) => (
                        <div key={field.name}>
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <Input
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                credentials: { ...prev.credentials, [field.name]: e.target.value },
                              }))
                            }
                          />
                          {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.authType === "api_key" && (
                        <>
                          <div>
                            <Label htmlFor="headerName">Header Name</Label>
                            <Input
                              id="headerName"
                              placeholder="X-API-Key"
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  credentials: { ...prev.credentials, headerName: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                              id="apiKey"
                              type="password"
                              placeholder="Enter your API key"
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  credentials: { ...prev.credentials, key: e.target.value },
                                }))
                              }
                            />
                          </div>
                        </>
                      )}

                      {config.authType === "bearer_token" && (
                        <div>
                          <Label htmlFor="token">Bearer Token</Label>
                          <Input
                            id="token"
                            type="password"
                            placeholder="Enter your bearer token"
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                credentials: { ...prev.credentials, token: e.target.value },
                              }))
                            }
                          />
                        </div>
                      )}

                      {config.authType === "basic_auth" && (
                        <>
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              placeholder="Enter username"
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  credentials: { ...prev.credentials, username: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="Enter password"
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  credentials: { ...prev.credentials, password: e.target.value },
                                }))
                              }
                            />
                          </div>
                        </>
                      )}

                      {config.authType === "oauth2" && (
                        <>
                          <div>
                            <Label htmlFor="clientId">Client ID</Label>
                            <Input
                              id="clientId"
                              placeholder="Enter client ID"
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  credentials: { ...prev.credentials, clientId: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientSecret">Client Secret</Label>
                            <Input
                              id="clientSecret"
                              type="password"
                              placeholder="Enter client secret"
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  credentials: { ...prev.credentials, clientSecret: e.target.value },
                                }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Sync Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sync Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="syncFrequency">Sync Frequency</Label>
                      <Select
                        value={config.syncFrequency}
                        onValueChange={(value) => setConfig((prev) => ({ ...prev, syncFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableWebhooks"
                        checked={config.enableWebhooks}
                        onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enableWebhooks: checked }))}
                      />
                      <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
                    </div>
                  </div>

                  {config.enableWebhooks && (
                    <div>
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={config.webhookUrl}
                        onChange={(e) => setConfig((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://your-app.com/webhooks"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCurrentStep("browse")}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("test")}
                    disabled={!config.name || !config.endpoint || Object.keys(config.credentials).length === 0}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "test" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <TestTube className="h-5 w-5 mr-2" />
                    Test Connection
                  </CardTitle>
                  <CardDescription>Verify your integration configuration</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setCurrentStep("configure")}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Configuration Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Configuration Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{config.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Endpoint:</span>
                      <span className="ml-2 font-medium">{config.endpoint}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Auth Type:</span>
                      <span className="ml-2 font-medium">{config.authType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sync Frequency:</span>
                      <span className="ml-2 font-medium">{config.syncFrequency}</span>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {testResult && (
                  <div
                    className={`border rounded-lg p-4 ${
                      testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                        {testResult.message}
                      </span>
                    </div>

                    {testResult.details && (
                      <div className="text-sm">
                        {testResult.success ? (
                          <div className="space-y-1">
                            <p className="text-green-700">Response time: {testResult.details.responseTime}ms</p>
                            <p className="text-green-700">Available endpoints:</p>
                            <ul className="list-disc list-inside ml-4 text-green-600">
                              {testResult.details.endpoints.map((endpoint: string, index: number) => (
                                <li key={index}>{endpoint}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-red-700">Error: {testResult.details.error}</p>
                            <p className="text-red-700">Status Code: {testResult.details.statusCode}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Test Button */}
                <div className="flex justify-center">
                  <Button onClick={handleTestConnection} disabled={isLoading} size="lg" className="min-w-[200px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {testResult?.success && (
                  <div className="flex justify-end">
                    <Button onClick={() => setCurrentStep("complete")}>Continue to Complete</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "complete" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Integration Ready
              </CardTitle>
              <CardDescription>Your integration is configured and ready to be created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Success Message */}
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.name} is ready to connect!</h3>
                  <p className="text-gray-600">
                    Your integration has been successfully configured and tested. Click the button below to create it.
                  </p>
                </div>

                {/* Final Configuration Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium mb-4">Final Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Integration Name:</span>
                      <span className="ml-2 font-medium">{config.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{selectedTemplate?.type || "Custom"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Provider:</span>
                      <span className="ml-2 font-medium">{selectedTemplate?.provider || "Custom"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sync Frequency:</span>
                      <span className="ml-2 font-medium">{config.syncFrequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Webhooks:</span>
                      <span className="ml-2 font-medium">{config.enableWebhooks ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Ready</Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep("test")}>
                    Back to Test
                  </Button>
                  <Button onClick={handleCreateIntegration} disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Integration...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Integration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
