"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileBarChart, Download, Search, Plus, Eye, Share, BarChart3, TrendingUp, Users, Database } from "lucide-react"
import { useRouter } from "next/navigation"

interface Report {
  id: string
  name: string
  type: "performance" | "usage" | "security" | "financial"
  description: string
  lastGenerated: string
  frequency: "daily" | "weekly" | "monthly" | "on-demand"
  status: "ready" | "generating" | "scheduled"
  size: string
}

export default function AnalyticsReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: "1",
      name: "API Performance Summary",
      type: "performance",
      description: "Comprehensive performance metrics for all API endpoints",
      lastGenerated: "2024-01-20 09:00",
      frequency: "daily",
      status: "ready",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "User Activity Report",
      type: "usage",
      description: "Detailed user engagement and activity patterns",
      lastGenerated: "2024-01-19 18:00",
      frequency: "weekly",
      status: "ready",
      size: "1.8 MB",
    },
    {
      id: "3",
      name: "Security Audit Report",
      type: "security",
      description: "Security events, threats, and compliance status",
      lastGenerated: "2024-01-18 12:00",
      frequency: "monthly",
      status: "ready",
      size: "3.2 MB",
    },
    {
      id: "4",
      name: "Revenue Analytics",
      type: "financial",
      description: "Financial performance and revenue tracking",
      lastGenerated: "Generating...",
      frequency: "monthly",
      status: "generating",
      size: "TBD",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case "performance":
        return "bg-blue-100 text-blue-800"
      case "usage":
        return "bg-green-100 text-green-800"
      case "security":
        return "bg-red-100 text-red-800"
      case "financial":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "generating":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <BarChart3 className="h-4 w-4" />
      case "usage":
        return <Users className="h-4 w-4" />
      case "security":
        return <Database className="h-4 w-4" />
      case "financial":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <FileBarChart className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || report.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Reports</h1>
          <p className="text-gray-600">Generate, schedule, and manage detailed analytics reports</p>
        </div>
        <Button onClick={() => router.push("/analytics/reports/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>{getTypeIcon(report.type)}</div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Type</Label>
                    <p className="font-medium capitalize">{report.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Frequency</Label>
                    <p className="font-medium capitalize">{report.frequency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Last Generated</Label>
                    <p className="font-medium">{report.lastGenerated}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">File Size</Label>
                    <p className="font-medium">{report.size}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" disabled={report.status === "generating"}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled={report.status === "generating"}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" disabled={report.status === "generating"}>
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Quick start templates for common report types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Performance Report</h4>
              </div>
              <p className="text-sm text-gray-600">API response times, throughput, and error rates</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">User Analytics</h4>
              </div>
              <p className="text-sm text-gray-600">User behavior, engagement, and retention metrics</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <Database className="h-5 w-5 text-red-600" />
                <h4 className="font-medium">Security Audit</h4>
              </div>
              <p className="text-sm text-gray-600">Security events, vulnerabilities, and compliance</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Business Intelligence</h4>
              </div>
              <p className="text-sm text-gray-600">Revenue, growth, and business metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
