"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BackButton } from "@/components/ui/back-button"
import { Search, Plus, MoreHorizontal, Users, UserCheck, UserX, Shield, Mail, Calendar } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "developer" | "viewer"
  status: "active" | "inactive" | "pending"
  lastLogin: string
  joinedDate: string
  integrations: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading users
    const loadUsers = async () => {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers([
        {
          id: "user_1",
          name: "John Smith",
          email: "john.smith@company.com",
          role: "admin",
          status: "active",
          lastLogin: "2 hours ago",
          joinedDate: "2023-01-15",
          integrations: 12,
        },
        {
          id: "user_2",
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          role: "developer",
          status: "active",
          lastLogin: "1 day ago",
          joinedDate: "2023-03-22",
          integrations: 8,
        },
        {
          id: "user_3",
          name: "Mike Chen",
          email: "mike.chen@company.com",
          role: "developer",
          status: "active",
          lastLogin: "3 hours ago",
          joinedDate: "2023-06-10",
          integrations: 15,
        },
        {
          id: "user_4",
          name: "Emily Davis",
          email: "emily.davis@company.com",
          role: "viewer",
          status: "inactive",
          lastLogin: "2 weeks ago",
          joinedDate: "2023-08-05",
          integrations: 3,
        },
        {
          id: "user_5",
          name: "Alex Rodriguez",
          email: "alex.rodriguez@company.com",
          role: "developer",
          status: "pending",
          lastLogin: "Never",
          joinedDate: "2024-01-20",
          integrations: 0,
        },
      ])

      setIsLoading(false)
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "developer":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "inactive":
        return <UserX className="h-4 w-4 text-gray-500" />
      case "pending":
        return <Calendar className="h-4 w-4 text-yellow-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <Link href="/users/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u) => u.status === "pending").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
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
                <Button
                  variant={filterRole === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("all")}
                >
                  All Roles
                </Button>
                <Button
                  variant={filterRole === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("admin")}
                >
                  Admin
                </Button>
                <Button
                  variant={filterRole === "developer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("developer")}
                >
                  Developer
                </Button>
                <Button
                  variant={filterRole === "viewer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("viewer")}
                >
                  Viewer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-blue-600">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.integrations} integrations</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Last Login:</span>
                    <p className="font-medium">{user.lastLogin}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <p className="font-medium">{new Date(user.joinedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className="font-medium capitalize">{user.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <Link href={`/users/${user.id}`}>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/users/${user.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Edit User
                    </Button>
                  </Link>
                  {user.status === "pending" && <Button size="sm">Approve</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterRole !== "all" ? "No users found" : "No users yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterRole !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first user"}
              </p>
              {!searchTerm && filterRole === "all" && (
                <Link href="/users/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
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
