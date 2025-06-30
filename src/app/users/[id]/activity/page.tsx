"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  description: string
  type: "success" | "warning" | "error" | "info"
  category: "auth" | "profile" | "security" | "system" | "data"
  ip?: string
  device?: string
  location?: string
  details?: Record<string, any>
}

export default function UserActivityPage() {
  const params = useParams()
  const userId = params.id as string
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("7")

  useEffect(() => {
    // Simulate loading activity data
    const loadActivities = () => {
      const mockActivities: ActivityLog[] = [
        {
          id: "1",
          timestamp: "2024-01-20 14:30:25",
          action: "Login",
          description: "Successful login from Chrome browser",
          type: "success",
          category: "auth",
          ip: "192.168.1.100",
          device: "Chrome 120.0 on MacOS",
          location: "San Francisco, CA",
        },
        {
          id: "2",
          timestamp: "2024-01-20 14:25:10",
          action: "Profile Update",
          description: "Updated profile information - changed phone number",
          type: "info",
          category: "profile",
          ip: "192.168.1.100",
          device: "Chrome 120.0 on MacOS",
        },
        {
          id: "3",
          timestamp: "2024-01-20 12:15:45",
          action: "Password Change",
          description: "Password changed successfully",
          type: "success",
          category: "security",
          ip: "192.168.1.100",
          device: "Chrome 120.0 on MacOS",
        },
        {
          id: "4",
          timestamp: "2024-01-20 10:30:15",
          action: "Failed Login Attempt",
          description: "Failed login attempt - incorrect password",
          type: "warning",
          category: "auth",
          ip: "203.0.113.1",
          device: "Firefox 119.0 on Windows",
          location: "Unknown",
        },
        {
          id: "5",
          timestamp: "2024-01-20 09:45:30",
          action: "Data Export",
          description: "Exported user data to CSV format",
          type: "info",
          category: "data",
          ip: "192.168.1.100",
          device: "Chrome 120.0 on MacOS",
        },
        {
          id: "6",
          timestamp: "2024-01-19 16:20:12",
          action: "Permission Change",
          description: "Admin permissions granted by system administrator",
          type: "success",
          category: "security",
          ip: "10.0.0.1",
          device: "System",
        },
        {
          id: "7",
          timestamp: "2024-01-19 14:15:45",
          action: "Session Timeout",
          description: "Session expired due to inactivity",
          type: "info",
          category: "auth",
          ip: "192.168.1.100",
          device: "Chrome 120.0 on MacOS",
        },
        {
          id: "8",
          timestamp: "2024-01-19 11:30:20",
          action: "API Access",
          description: "Accessed user management API endpoint",
          type: "info",
          category: "system",
          ip: "192.168.1.100",
          device: "Postman API Client",
        },
        {
          id: "9",
          timestamp: "2024-01-18 15:45:10",
          action: "Security Alert",
          description: "Suspicious login attempt blocked",
          type: "error",
          category: "security",
          ip: "198.51.100.1",
          device: "Unknown",
          location: "Unknown",
        },
        {
          id: "10",
          timestamp: "2024-01-18 13:20:35",
          action: "Profile View",
          description: "Profile viewed by administrator",
          type: "info",
          category: "profile",
          ip: "10.0.0.1",
          device: "Chrome 120.0 on Windows",
        },
      ]

      setActivities(mockActivities)
      setFilteredActivities(mockActivities)
      setIsLoading(false)
    }

    setTimeout(loadActivities, 800)
  }, [userId])

  useEffect(() => {
    // Filter activities based on search and filters
    let filtered = activities

    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.ip?.includes(searchTerm) ||
          activity.device?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((activity) => activity.type === filterType)
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((activity) => activity.category === filterCategory)
    }

    // Filter by date range
    if (dateRange !== "all") {
      const days = Number.parseInt(dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= cutoffDate
      })
    }

    setFilteredActivities(filtered)
  }, [activities, searchTerm, filterType, filterCategory, dateRange])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "auth":
        return "bg-purple-100 text-purple-800"
      case "security":
        return "bg-red-100 text-red-800"
      case "profile":
        return "bg-blue-100 text-blue-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      case "data":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleExport = () => {
    // Simulate export functionality
    const csvContent = [
      ["Timestamp", "Action", "Description", "Type", "Category", "IP", "Device", "Location"],
      ...filteredActivities.map((activity) => [
        activity.timestamp,
        activity.action,
        activity.description,
        activity.type,
        activity.category,
        activity.ip || "",
        activity.device || "",
        activity.location || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `user-${userId}-activity-log.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/users/${userId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Activity Log</h1>
              <p className="text-gray-600">Detailed activity history and audit trail</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activities.filter((a) => a.type === "success").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {activities.filter((a) => a.type === "warning").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">
                    {activities.filter((a) => a.type === "error").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Info</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {activities.filter((a) => a.type === "info").length}
                  </p>
                </div>
                <Info className="h-8 w-8 text-blue-600" />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log ({filteredActivities.length} events)</CardTitle>
            <CardDescription>Chronological list of user activities and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{activity.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{activity.action}</TableCell>
                      <TableCell className="max-w-xs truncate" title={activity.description}>
                        {activity.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(activity.type)}
                          <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(activity.category)} variant="outline">
                          {activity.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{activity.ip || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate" title={activity.device}>
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-gray-400" />
                          <span>{activity.device || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{activity.location || "-"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== "all" || filterCategory !== "all"
                    ? "Try adjusting your search criteria"
                    : "No activity logs available for this user"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
