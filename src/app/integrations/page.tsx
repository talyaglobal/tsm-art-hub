"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BackButton } from "@/components/ui/back-button"
import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface Integration {
  id: string
  name: string
  source: string
  destination: string
  status: "active" | "inactive" | "error" | "syncing"
  lastSync: string
  syncFrequency: string
  recordsProcessed: number
  errorCount: number
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading integrations
    const loadIntegrations = async () => {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIntegrations([
        {
          id: "int_1",
          name: "Shopify to Salesforce Sync",
          source: "Shopify",
          destination: "Salesforce",
          status: "active",
          lastSync: "2 minutes ago",
          syncFrequency: "Every 15 minutes",
          recordsProcessed: 1250,
          errorCount: 0,
        },
        {
          id: "int_2",
          name: "Stripe Payment Processing",
          source: "Stripe",
          destination: "QuickBooks",
          status: "syncing",
          lastSync: "Currently syncing",
          syncFrequency: "Real-time",
          recordsProcessed: 890,
          errorCount: 2,
        },
        {
          id: "int_3",
          name: "WooCommerce Inventory",
          source: "WooCommerce",
          destination: "NetSuite",
          status: "error",
          lastSync: "1 hour ago",
          syncFrequency: "Hourly",
          recordsProcessed: 0,
          errorCount: 15,
        },
        {
          id: "int_4",
          name: "HubSpot Lead Management",
          source: "HubSpot",
          destination: "Pipedrive",
          status: "inactive",
          lastSync: "3 days ago",
          syncFrequency: "Daily",
          recordsProcessed: 456,
          errorCount: 0,
        },
      ])

      setIsLoading(false)
    }

    loadIntegrations()
  }, [])

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || integration.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "syncing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "inactive":
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "syncing":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <BackButton href="/dashboard" />
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton href="/dashboard" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
            <p className="text-gray-600">Manage your data integrations and workflows</p>
          </div>
          <Link href="/integrations/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Integration
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
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
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("active")}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === "error" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("error")}
                >
                  Errors
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("inactive")}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations List */}
        <div className="space-y-4">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600">
                          {integration.source} → {integration.destination}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(integration.status)}>{integration.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Last Sync:</span>
                    <p className="font-medium">{integration.lastSync}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequency:</span>
                    <p className="font-medium">{integration.syncFrequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Records Processed:</span>
                    <p className="font-medium">{integration.recordsProcessed.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Errors:</span>
                    <p className={`font-medium ${integration.errorCount > 0 ? "text-red-600" : "text-green-600"}`}>
                      {integration.errorCount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all" ? "No integrations found" : "No integrations yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first integration"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Link href="/integrations/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Integration
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
