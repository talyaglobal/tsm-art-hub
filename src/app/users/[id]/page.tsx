"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Settings,
  Edit,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: "admin" | "manager" | "user" | "viewer"
  department: string
  title: string
  location: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  lastLogin: string
  permissions: string[]
  recentActivity: ActivityLog[]
  sessions: Session[]
  stats: UserStats
}

interface ActivityLog {
  id: string
  action: string
  description: string
  timestamp: string
  type: "success" | "warning" | "error" | "info"
  ip?: string
}

interface Session {
  id: string
  device: string
  browser: string
  location: string
  startTime: string
  lastActive: string
  status: "active" | "expired"
}

interface UserStats {
  totalLogins: number
  avgSessionDuration: string
  lastPasswordChange: string
  failedLoginAttempts: number
  dataUsage: string
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    const loadUser = () => {
      setUser({
        id: userId,
        name: "John Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 123-4567",
        avatar: "/placeholder.svg?height=120&width=120",
        role: "admin",
        department: "Engineering",
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        status: "active",
        joinDate: "2023-01-15",
        lastLogin: "2 hours ago",
        permissions: ["read", "write", "admin", "delete"],
        recentActivity: [
          {
            id: "1",
            action: "Login",
            description: "Successful login from Chrome on MacOS",
            timestamp: "2024-01-20 14:30",
            type: "success",
            ip: "192.168.1.100",
          },
          {
            id: "2",
            action: "Profile Update",
            description: "Updated profile information",
            timestamp: "2024-01-20 12:15",
            type: "info",
          },
          {
            id: "3",
            action: "Password Change",
            description: "Password changed successfully",
            timestamp: "2024-01-19 16:45",
            type: "success",
          },
          {
            id: "4",
            action: "Failed Login",
            description: "Failed login attempt detected",
            timestamp: "2024-01-18 09:20",
            type: "warning",
            ip: "203.0.113.1",
          },
        ],
        sessions: [
          {
            id: "1",
            device: "MacBook Pro",
            browser: "Chrome 120.0",
            location: "San Francisco, CA",
            startTime: "2024-01-20 08:00",
            lastActive: "2024-01-20 14:30",
            status: "active",
          },
          {
            id: "2",
            device: "iPhone 15",
            browser: "Safari Mobile",
            location: "San Francisco, CA",
            startTime: "2024-01-20 07:30",
            lastActive: "2024-01-20 13:45",
            status: "active",
          },
          {
            id: "3",
            device: "Windows PC",
            browser: "Edge 119.0",
            location: "New York, NY",
            startTime: "2024-01-19 14:00",
            lastActive: "2024-01-19 18:00",
            status: "expired",
          },
        ],
        stats: {
          totalLogins: 247,
          avgSessionDuration: "4h 32m",
          lastPasswordChange: "2024-01-19",
          failedLoginAttempts: 2,
          dataUsage: "2.4 GB",
        },
      })
      setIsLoading(false)
    }

    setTimeout(loadUser, 800)
  }, [userId])

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600 mb-4">The requested user profile could not be found.</p>
          <Link href="/users">
            <Button>Back to Users</Button>
          </Link>
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
            <Link href="/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">Detailed information and activity for {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/users/${userId}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/users/${userId}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="destructive" size="sm">
              <UserX className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-lg text-gray-600">{user.title}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getRoleColor(user.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {user.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {user.joinDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logins</p>
                  <p className="text-2xl font-bold text-gray-900">{user.stats.totalLogins}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold text-gray-900">{user.stats.avgSessionDuration}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                  <p className="text-2xl font-bold text-red-600">{user.stats.failedLoginAttempts}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{user.stats.dataUsage}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.action}</h4>
                          <span className="text-sm text-gray-500">{activity.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        {activity.ip && <p className="text-xs text-gray-500">IP: {activity.ip}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Current and recent user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.device}</TableCell>
                        <TableCell>{session.browser}</TableCell>
                        <TableCell>{session.location}</TableCell>
                        <TableCell>{session.startTime}</TableCell>
                        <TableCell>{session.lastActive}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              session.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {session.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
                <CardDescription>Current permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.permissions.map((permission) => (
                    <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium capitalize">{permission.replace("_", " ")}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Granted
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Information</CardTitle>
                <CardDescription>Security settings and recent security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Password Security</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Changed:</span>
                          <span className="text-sm font-medium">{user.stats.lastPasswordChange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Strength:</span>
                          <Badge className="bg-green-100 text-green-800">Strong</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">2FA Enabled:</span>
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Account Security</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Failed Attempts:</span>
                          <span className="text-sm font-medium">{user.stats.failedLoginAttempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Account Locked:</span>
                          <Badge className="bg-green-100 text-green-800">No</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email Verified:</span>
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
