"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Crown,
  Search,
  Plus,
  Shield,
  Key,
  Settings,
  MoreHorizontal,
  Eye,
  Edit,
  UserMinus,
  Clock,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Administrator {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin" | "moderator"
  department: string
  permissions: string[]
  lastLogin: string
  status: "active" | "inactive"
  createdAt: string
  avatar?: string
}

export default function AdminsPage() {
  const [administrators] = useState<Administrator[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@company.com",
      role: "super_admin",
      department: "Engineering",
      permissions: ["all"],
      lastLogin: "2 hours ago",
      status: "active",
      createdAt: "2023-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@company.com",
      role: "admin",
      department: "Operations",
      permissions: ["user_management", "system_config", "analytics"],
      lastLogin: "1 day ago",
      status: "active",
      createdAt: "2023-02-20",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@company.com",
      role: "admin",
      department: "Security",
      permissions: ["security", "audit", "user_management"],
      lastLogin: "3 hours ago",
      status: "active",
      createdAt: "2023-03-10",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@company.com",
      role: "moderator",
      department: "Support",
      permissions: ["user_support", "content_moderation"],
      lastLogin: "1 week ago",
      status: "inactive",
      createdAt: "2023-04-05",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "moderator":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      case "moderator":
        return <Key className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAdmins = administrators.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrator Management</h1>
          <p className="text-gray-600">Manage system administrators and their permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Administrator
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Crown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{administrators.length}</div>
            <p className="text-xs text-gray-600 mt-1">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{administrators.filter((a) => a.role === "super_admin").length}</div>
            <p className="text-xs text-gray-600 mt-1">Full access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{administrators.filter((a) => a.status === "active").length}</div>
            <p className="text-xs text-gray-600 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {administrators.filter((a) => a.lastLogin.includes("hour") || a.lastLogin.includes("minute")).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search administrators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Administrators List */}
      <div className="space-y-4">
        {filteredAdmins.map((admin) => (
          <Card key={admin.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={admin.avatar || "/placeholder.svg"} alt={admin.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {admin.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{admin.name}</h3>
                      <Badge className={getRoleColor(admin.role)} variant="outline">
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(admin.role)}
                          <span className="capitalize">{admin.role.replace("_", " ")}</span>
                        </div>
                      </Badge>
                      <Badge className={getStatusColor(admin.status)} variant="outline">
                        {admin.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{admin.email}</p>
                    <p className="text-sm text-gray-500">
                      {admin.department} • Member since {admin.createdAt}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.slice(0, 3).map((permission, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {permission.replace("_", " ")}
                      </Badge>
                    ))}
                    {admin.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{admin.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Last Login</h4>
                  <p className="text-sm">{admin.lastLogin}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Department</h4>
                  <p className="text-sm">{admin.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Overview of administrator permissions across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Placeholder for permission matrix content */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
