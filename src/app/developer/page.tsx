"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"
import {
  Code,
  FileText,
  Zap,
  Settings,
  BookOpen,
  Download,
  TestTube,
  Rocket,
  Globe,
  Package,
  Terminal,
  GitBranch,
} from "lucide-react"
import Link from "next/link"

interface DeveloperTool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  href: string
  status: "available" | "beta" | "coming-soon"
  category: "generation" | "testing" | "documentation" | "integration"
}

export default function DeveloperPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const tools: DeveloperTool[] = [
    {
      id: "sdk-generator",
      name: "SDK Generator",
      description: "Generate client SDKs for multiple programming languages",
      icon: <Code className="h-6 w-6" />,
      href: "/developer/sdk-generator",
      status: "available",
      category: "generation",
    },
    {
      id: "documentation",
      name: "Documentation Generator",
      description: "Create comprehensive API documentation with testing capabilities",
      icon: <FileText className="h-6 w-6" />,
      href: "/developer/documentation",
      status: "available",
      category: "documentation",
    },
    {
      id: "connector-framework",
      name: "Connector Framework",
      description: "Build custom connectors with our framework and templates",
      icon: <Zap className="h-6 w-6" />,
      href: "/developer/connectors",
      status: "beta",
      category: "integration",
    },
    {
      id: "api-testing",
      name: "API Testing Suite",
      description: "Test your APIs with automated testing and validation",
      icon: <TestTube className="h-6 w-6" />,
      href: "/developer/testing",
      status: "available",
      category: "testing",
    },
    {
      id: "live-docs",
      name: "Live Documentation",
      description: "Interactive API documentation with real-time testing",
      icon: <Globe className="h-6 w-6" />,
      href: "/developer/documentation/live",
      status: "available",
      category: "documentation",
    },
    {
      id: "webhook-builder",
      name: "Webhook Builder",
      description: "Create and manage webhooks with visual workflow builder",
      icon: <Settings className="h-6 w-6" />,
      href: "/developer/webhooks",
      status: "coming-soon",
      category: "integration",
    },
  ]

  const categories = [
    { id: "all", name: "All Tools", count: tools.length },
    { id: "generation", name: "Code Generation", count: tools.filter((t) => t.category === "generation").length },
    { id: "documentation", name: "Documentation", count: tools.filter((t) => t.category === "documentation").length },
    { id: "testing", name: "Testing", count: tools.filter((t) => t.category === "testing").length },
    { id: "integration", name: "Integration", count: tools.filter((t) => t.category === "integration").length },
  ]

  const filteredTools = selectedCategory === "all" ? tools : tools.filter((tool) => tool.category === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "beta":
        return "bg-blue-100 text-blue-800"
      case "coming-soon":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available"
      case "beta":
        return "Beta"
      case "coming-soon":
        return "Coming Soon"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton href="/dashboard" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Portal</h1>
          <p className="text-gray-600">Build, test, and deploy integrations with our developer tools</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tools</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tools.filter((t) => t.status === "available").length}</div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beta Tools</CardTitle>
              <Terminal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tools.filter((t) => t.status === "beta").length}</div>
              <p className="text-xs text-muted-foreground">In testing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tools.filter((t) => t.status === "coming-soon").length}</div>
              <p className="text-xs text-muted-foreground">In development</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tools.length}</div>
              <p className="text-xs text-muted-foreground">All categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">{tool.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <Badge className={getStatusColor(tool.status)}>{getStatusText(tool.status)}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{tool.description}</CardDescription>

                {tool.status === "available" || tool.status === "beta" ? (
                  <Link href={tool.href}>
                    <Button className="w-full">{tool.status === "beta" ? "Try Beta" : "Launch Tool"}</Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Getting Started */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Quick start guides and resources for developers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">API Documentation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Comprehensive API reference with examples and testing capabilities
                </p>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Docs
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">SDK Downloads</h4>
                <p className="text-sm text-gray-600 mb-3">Pre-built SDKs for popular programming languages</p>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDKs
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Code Examples</h4>
                <p className="text-sm text-gray-600 mb-3">Sample code and integration patterns to get you started</p>
                <Button variant="outline" size="sm">
                  <Code className="h-4 w-4 mr-2" />
                  Browse Examples
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest improvements and new features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">SDK Generator v2.0 Released</p>
                  <p className="text-sm text-gray-600">Added support for Go and Rust languages</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Documentation Generator Enhanced</p>
                  <p className="text-sm text-gray-600">New interactive testing features and improved themes</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Connector Framework Beta</p>
                  <p className="text-sm text-gray-600">Build custom connectors with our new framework</p>
                  <p className="text-xs text-gray-500">2 weeks ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
