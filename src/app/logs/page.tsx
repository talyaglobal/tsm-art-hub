"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye, Clock, AlertCircle, CheckCircle, XCircle, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackButton } from "@/components/ui/back-button"

interface LogEntry {
  id: string
  timestamp: string
  api: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  status: number
  responseTime: number
  requestSize: number
  responseSize: number
  userAgent: string
  ip: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [apiFilter, setApiFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLogs = () => {
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: "2024-01-20 14:30:25",
          api: "Shopify API",
          method: "GET",
          endpoint: "/admin/api/2023-10/products.json",
          status: 200,
          responseTime: 120,
          requestSize: 0,
          responseSize: 15420,
          userAgent: "TSmart-Hub/1.0",
          ip: "192.168.1.100",
        },
        {
          id: "2",
          timestamp: "2024-01-20 14:29:45",
          api: "Stripe API",
          method: "POST",
          endpoint: "/v1/charges",
          status: 401,
          responseTime: 234,
          requestSize: 512,
          responseSize: 128,
          userAgent: "TSmart-Hub/1.0",
          ip: "192.168.1.100",
        },
        {
          id: "3",
          timestamp: "2024-01-20 14:28:12",
          api: "QuickBooks API",
          method: "GET",
          endpoint: "/v3/companyinfo/1",
          status: 200,
          responseTime: 89,
          requestSize: 0,
          responseSize: 2048,
          userAgent: "TSmart-Hub/1.0",
          ip: "192.168.1.100",
        },
        {
          id: "4",
          timestamp: "2024-01-20 14:27:33",
          api: "WMS API",
          method: "PUT",
          endpoint: "/v2/inventory/update",
          status: 500,
          responseTime: 156,
          requestSize: 1024,
          responseSize: 256,
          userAgent: "TSmart-Hub/1.0",
          ip: "192.168.1.100",
        },
        {
          id: "5",
          timestamp: "2024-01-20 14:26:58",
          api: "Shopify API",
          method: "GET",
          endpoint: "/admin/api/2023-10/orders.json",
          status: 200,
          responseTime: 145,
          requestSize: 0,
          responseSize: 8934,
          userAgent: "TSmart-Hub/1.0",
          ip: "192.168.1.100",
        },
      ]

      setLogs(mockLogs)
      setFilteredLogs(mockLogs)
      setIsLoading(false)
    }

    setTimeout(loadLogs, 800)
  }, [])

  useEffect(() => {
    let filtered = logs

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.api.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.method.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "success") {
        filtered = filtered.filter((log) => log.status >= 200 && log.status < 300)
      } else if (statusFilter === "error") {
        filtered = filtered.filter((log) => log.status >= 400)
      } else if (statusFilter === "warning") {
        filtered = filtered.filter((log) => log.status >= 300 && log.status < 400)
      }
    }

    // Apply API filter
    if (apiFilter !== "all") {
      filtered = filtered.filter((log) => log.api === apiFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, statusFilter, apiFilter])

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (status >= 400) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-100 text-green-800">Success</Badge>
    } else if (status >= 400) {
      return <Badge className="bg-red-100 text-red-800">Error</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API logs...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">API Logs & Monitoring</h1>
              <p className="text-gray-600">Real-time API request logs and system monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Last 24h
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Logs</CardTitle>
            <CardDescription>Search and filter API logs by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success (2xx)</SelectItem>
                  <SelectItem value="warning">Warning (3xx)</SelectItem>
                  <SelectItem value="error">Error (4xx/5xx)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={apiFilter} onValueChange={setApiFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="API" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All APIs</SelectItem>
                  <SelectItem value="Shopify API">Shopify API</SelectItem>
                  <SelectItem value="Stripe API">Stripe API</SelectItem>
                  <SelectItem value="QuickBooks API">QuickBooks API</SelectItem>
                  <SelectItem value="WMS API">WMS API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Request Logs</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {log.method}
                          </Badge>
                          <span className="font-medium text-sm">{log.api}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm font-mono text-gray-600 mb-2">{log.endpoint}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Response Time:</span>
                            <br />
                            {log.responseTime}ms
                          </div>
                          <div>
                            <span className="font-medium">Request Size:</span>
                            <br />
                            {formatBytes(log.requestSize)}
                          </div>
                          <div>
                            <span className="font-medium">Response Size:</span>
                            <br />
                            {formatBytes(log.responseSize)}
                          </div>
                          <div>
                            <span className="font-medium">IP Address:</span>
                            <br />
                            {log.ip}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{log.timestamp}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
