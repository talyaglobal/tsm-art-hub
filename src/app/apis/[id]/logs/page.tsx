"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/layout/page-header"
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  FileJson,
  FileSpreadsheet,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  message: string
  source: string
  userId?: string
  requestId?: string
  duration?: number
  statusCode?: number
  method?: string
  endpoint?: string
}

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-15T10:30:00Z",
    level: "INFO",
    message: "API request processed successfully",
    source: "api-gateway",
    userId: "user_123",
    requestId: "req_abc123",
    duration: 245,
    statusCode: 200,
    method: "GET",
    endpoint: "/api/users",
  },
  {
    id: "2",
    timestamp: "2024-01-15T10:29:45Z",
    level: "ERROR",
    message: "Database connection timeout",
    source: "database",
    requestId: "req_def456",
    duration: 5000,
    statusCode: 500,
    method: "POST",
    endpoint: "/api/orders",
  },
  {
    id: "3",
    timestamp: "2024-01-15T10:29:30Z",
    level: "WARN",
    message: "Rate limit approaching for user",
    source: "rate-limiter",
    userId: "user_456",
    requestId: "req_ghi789",
    duration: 120,
    statusCode: 429,
    method: "GET",
    endpoint: "/api/data",
  },
  {
    id: "4",
    timestamp: "2024-01-15T10:29:15Z",
    level: "DEBUG",
    message: "Cache miss for key: user_profile_789",
    source: "cache",
    requestId: "req_jkl012",
    duration: 50,
  },
  {
    id: "5",
    timestamp: "2024-01-15T10:29:00Z",
    level: "INFO",
    message: "User authentication successful",
    source: "auth-service",
    userId: "user_789",
    requestId: "req_mno345",
    duration: 180,
    statusCode: 200,
    method: "POST",
    endpoint: "/api/auth/login",
  },
]

export default function APILogsPage({ params }: { params: { id: string } }) {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "excel">("csv")
  const [exportProgress, setExportProgress] = useState(0)

  useEffect(() => {
    filterLogs()
  }, [searchQuery, levelFilter, sourceFilter, logs])

  const filterLogs = () => {
    let filtered = logs

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userId?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((log) => log.level === levelFilter)
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter((log) => log.source === sourceFilter)
    }

    setFilteredLogs(filtered)
  }

  const refreshLogs = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const exportLogs = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Simulate export processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate export content based on format
    let content: string
    let filename: string
    let mimeType: string

    const exportData = filteredLogs.map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleString(),
      level: log.level,
      message: log.message,
      source: log.source,
      userId: log.userId || "",
      requestId: log.requestId || "",
      duration: log.duration || "",
      statusCode: log.statusCode || "",
      method: log.method || "",
      endpoint: log.endpoint || "",
    }))

    switch (exportFormat) {
      case "csv":
        const csvHeaders = Object.keys(exportData[0]).join(",")
        const csvRows = exportData.map((row) => Object.values(row).join(","))
        content = [csvHeaders, ...csvRows].join("\n")
        filename = `api-logs-${params.id}-${new Date().toISOString().split("T")[0]}.csv`
        mimeType = "text/csv"
        break

      case "json":
        const jsonExport = {
          exportInfo: {
            apiId: params.id,
            exportDate: new Date().toISOString(),
            totalRecords: filteredLogs.length,
            filters: {
              search: searchQuery || null,
              level: levelFilter !== "all" ? levelFilter : null,
              source: sourceFilter !== "all" ? sourceFilter : null,
            },
          },
          logs: exportData.map((log) => ({
            ...log,
            timestampISO: filteredLogs.find((l) => l.message === log.message.replace(/,/g, ""))?.timestamp,
            formattedTimestamp: log.timestamp,
          })),
        }
        content = JSON.stringify(jsonExport, null, 2)
        filename = `api-logs-${params.id}-${new Date().toISOString().split("T")[0]}.json`
        mimeType = "application/json"
        break

      case "excel":
        // For Excel format, we'll use tab-separated values (in a real implementation, you'd use a library like xlsx)
        const excelHeaders = Object.keys(exportData[0]).join("\t")
        const excelRows = exportData.map((row) => Object.values(row).join("\t"))
        content = [excelHeaders, ...excelRows].join("\n")
        filename = `api-logs-${params.id}-${new Date().toISOString().split("T")[0]}.xlsx`
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        break

      default:
        content = ""
        filename = ""
        mimeType = ""
    }

    // Complete progress
    setExportProgress(100)

    // Download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Reset export state
    setTimeout(() => {
      setIsExporting(false)
      setExportProgress(0)
    }, 500)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "INFO":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "DEBUG":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "ERROR":
        return "destructive"
      case "WARN":
        return "outline"
      case "INFO":
        return "secondary"
      case "DEBUG":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="h-4 w-4" />
      case "json":
        return <FileJson className="h-4 w-4" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "csv":
        return "Comma-separated values for spreadsheet applications"
      case "json":
        return "Structured data with metadata and export information"
      case "excel":
        return "Excel-compatible format for advanced analysis"
      default:
        return ""
    }
  }

  const uniqueSources = Array.from(new Set(logs.map((log) => log.source)))

  return (
    <div className="space-y-6">
      <PageHeader title={`API Logs - ${params.id}`} description="Monitor and analyze API request logs in real-time">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLogs}
            disabled={isLoading}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Export
          </CardTitle>
          <CardDescription>Filter logs and export data in multiple formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={exportFormat} onValueChange={(value: "csv" | "json" | "excel") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{getFormatDescription(exportFormat)}</div>
            <Button
              onClick={exportLogs}
              disabled={isExporting || filteredLogs.length === 0}
              className="flex items-center gap-2"
            >
              {getFormatIcon(exportFormat)}
              {isExporting ? `Exporting ${exportFormat.toUpperCase()}...` : `Export ${exportFormat.toUpperCase()}`}
            </Button>
          </div>

          {isExporting && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Exporting {filteredLogs.length} log entries...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
          <CardDescription>Real-time API request and system logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <Badge variant={getLevelBadgeVariant(log.level) as any}>{log.level}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={log.message}>
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.source}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.requestId || "-"}</TableCell>
                    <TableCell>{log.duration ? `${log.duration}ms` : "-"}</TableCell>
                    <TableCell>
                      {log.statusCode && (
                        <Badge variant={log.statusCode >= 400 ? "destructive" : "secondary"}>{log.statusCode}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
