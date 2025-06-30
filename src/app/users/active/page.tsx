"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Settings,
  Mail,
  Activity,
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageLayout } from "@/components/layout/page-layout"

interface ActiveUser {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user" | "viewer"
  department: string
  lastActive: string
  sessionsToday: number
  totalSessions: number
  avatar?: string
  status: "online" | "away" | "offline"
}

export default function ActiveUsersPage() {
  const [users, setUsers] = useState<ActiveUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadUsers = () => {
      setUsers([
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@company.com",
          role: "admin",
          department: "Engineering",
          lastActive: "2 minutes ago",
          sessionsToday: 3,
          totalSessions: 247,
          status: "online",
        },
        {
          id: "2",
          name: "Sarah Wilson",
          email: "sarah.wilson@company.com",
          role: "manager",
          department: "Marketing",
          lastActive: "5 minutes ago",
          sessionsToday: 2,
          totalSessions: 189,
          status: "online",
        },
        {
          id: "3",
          name: "Mike Johnson",
          email: "mike.johnson@company.com",
          role: "user",
          department: "Sales",
          lastActive: "12 minutes ago",
          sessionsToday: 1,
          totalSessions: 156,
          status: "away",
        },
        {
          id: "4",
          name: "Emily Davis",
          email: "emily.davis@company.com",
          role: "user",
          department: "Support",
          lastActive: "8 minutes ago",
          sessionsToday: 4,
          totalSessions: 298,
          status: "online",
        },
        {
          id: "5",
          name: "Alex Chen",
          email: "alex.chen@company.com",
          role: "viewer",
          department: "Analytics",
          lastActive: "15 minutes ago",
          sessionsToday: 1,
          totalSessions: 87,
          status: "away",
        },
      ])
      setIsLoading(false)
    }

    setTimeout(loadUsers, 600)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-green-100 text-green-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const stats = {
    totalActive: users.length,
    online: users.filter((u) => u.status === "online").length,
    away: users.filter((u) => u.status === "away").length,
    totalSessions: users.reduce((sum, u) => sum + u.sessionsToday, 0),
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
      <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <PageLayout title="Active Users" description="Currently active users and their session information">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading active users...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Active Users Database"
      description="Real-time view of currently active users and their session activity"
      headerActions={headerActions}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActive}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Away</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.away}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSessions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={filterRole === "all" ? "default" : "outline"} onClick={() => setFilterRole("all")} size="sm">
            All Roles
          </Button>
          <Button
            variant={filterRole === "admin" ? "default" : "outline"}
            onClick={() => setFilterRole("admin")}
            size="sm"
          >
            Admin
          </Button>
          <Button
            variant={filterRole === "manager" ? "default" : "outline"}
            onClick={() => setFilterRole("manager")}
            size="sm"
          >
            Manager
          </Button>
          <Button
            variant={filterRole === "user" ? "default" : "outline"}
            onClick={() => setFilterRole("user")}
            size="sm"
          >
            User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Users currently active in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Sessions Today</TableHead>
                  <TableHead>Total Sessions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                        <span className="text-sm capitalize">{user.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.lastActive}</TableCell>
                    <TableCell className="text-sm font-medium">{user.sessionsToday}</TableCell>
                    <TableCell className="text-sm">{user.totalSessions}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <UserCheck className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Access
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active users found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms" : "No users are currently active"}
          </p>
        </div>
      )}
    </PageLayout>
  )
}
