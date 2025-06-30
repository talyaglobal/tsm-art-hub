"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react"

interface Report {
  id: string
  name: string
  description: string
  type: "performance" | "usage" | "security" | "financial" | "custom"
  status: "completed" | "running" | "scheduled" | "failed"
  createdBy: string
  createdAt: string
  lastRun: string
  nextRun?: string
  frequency: "on-demand" | "daily" | "weekly" | "monthly"
  format: "pdf" | "excel" | "csv" | "json"
  size: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const loadReports = () => {
      const mockReports: Report[] = [
        {
          id: "1",
          name: "API Performance Dashboard",
          description: "Comprehensive API performance metrics and response times",
          type: "performance",
          status: "completed",
          createdBy: "John Doe",
          createdAt: "2024-01-15",
          lastRun: "2 hours ago",
          nextRun: "Tomorrow at 9:00 AM",
          frequency: "daily",
          format: "pdf",
          size: "2.4 MB",
        },
        {
          id: "2",
          name: "Monthly Usage Analytics",
          description: "User engagement and API usage statistics for the month",
          type: "usage",
          status: "running",
          createdBy: "Jane Smith",
          createdAt: "2024-01-10",
          lastRun: "1 day ago",
          nextRun: "Next Monday",
          frequency: "monthly",
          format: "excel",
          size: "5.1 MB",
        },
        {
          id: "3",
          name: "Security Audit Report",
          description: "Security events, vulnerabilities, and compliance status",
          type: "security",
          status: "completed",
          createdBy: "Mike Johnson",
          createdAt: "2024-01-08",
          lastRun: "3 days ago",
          frequency: "weekly",
          format: "pdf",
          size: "1.8 MB",
        },
        {
          id: "4",
          name: "Revenue Analysis Q1",
          description: "Quarterly financial performance and revenue breakdown",
          type: "financial",
          status: "scheduled",
          createdBy: "Sarah Wilson",
          createdAt: "2024-01-05",
          lastRun: "Never",
          nextRun: "End of quarter",
          frequency: "on-demand",
          format: "excel",
          size: "N/A",
        },
        {
          id: "5",
          name: "Custom Integration Report",
          description: "Custom report for third-party integrations performance",
          type: "custom",
          status: "failed",
          createdBy: "David Brown",
          createdAt: "2024-01-03",
          lastRun: "1 week ago",
          frequency: "weekly",
          format: "json",
          size: "892 KB",
        },
      ]

      setReports(mockReports)
      setFilteredReports(mockReports)
      setIsLoading(false)
    }

    setTimeout(loadReports, 800)
  }, [])

  useEffect(() => {
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.createdBy.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((report) => report.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, typeFilter, statusFilter])

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
      case "custom":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <BarChart3 className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">Generate and manage analytics reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/analytics/reports/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-gray-600">All reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.filter((r) => r.status === "completed").length}</div>
              <p className="text-xs text-gray-600">Successfully generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.filter((r) => r.status === "running").length}</div>
              <p className="text-xs text-gray-600">Currently processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.filter((r) => r.status === "scheduled").length}</div>
              <p className="text-xs text-gray-600">Upcoming reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-600">{filteredReports.length} reports found</div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Reports</CardTitle>
            <CardDescription>Manage your generated and scheduled reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{report.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {report.frequency}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {report.format.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{report.createdBy}</p>
                          <p className="text-xs text-gray-600">{report.createdAt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{report.lastRun}</p>
                          {report.nextRun && <p className="text-xs text-gray-600">Next: {report.nextRun}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{report.size}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Report
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Run Now
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
