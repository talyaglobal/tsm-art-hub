"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Key, Shield, Users, Settings, Plus, Search, Save, RotateCcw } from "lucide-react"

interface Permission {
  id: string
  name: string
  description: string
  category: string
  level: "read" | "write" | "admin"
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
}

export default function PermissionsPage() {
  const [permissions] = useState<Permission[]>([
    {
      id: "users.read",
      name: "View Users",
      description: "Can view user profiles and information",
      category: "Users",
      level: "read",
    },
    {
      id: "users.write",
      name: "Manage Users",
      description: "Can create, edit, and delete users",
      category: "Users",
      level: "write",
    },
    {
      id: "users.admin",
      name: "User Administration",
      description: "Full user management including roles",
      category: "Users",
      level: "admin",
    },
    {
      id: "analytics.read",
      name: "View Analytics",
      description: "Can access analytics and reports",
      category: "Analytics",
      level: "read",
    },
    {
      id: "analytics.write",
      name: "Manage Analytics",
      description: "Can create and modify reports",
      category: "Analytics",
      level: "write",
    },
    { id: "apis.read", name: "View APIs", description: "Can view API configurations", category: "APIs", level: "read" },
    {
      id: "apis.write",
      name: "Manage APIs",
      description: "Can create and modify API integrations",
      category: "APIs",
      level: "write",
    },
    {
      id: "security.read",
      name: "View Security",
      description: "Can view security settings and logs",
      category: "Security",
      level: "read",
    },
    {
      id: "security.write",
      name: "Manage Security",
      description: "Can modify security configurations",
      category: "Security",
      level: "write",
    },
    {
      id: "system.admin",
      name: "System Administration",
      description: "Full system access and configuration",
      category: "System",
      level: "admin",
    },
  ])

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access",
      permissions: ["users.admin", "analytics.write", "apis.write", "security.write", "system.admin"],
      userCount: 3,
      isSystem: true,
    },
    {
      id: "manager",
      name: "Manager",
      description: "Management level access",
      permissions: ["users.write", "analytics.write", "apis.read"],
      userCount: 8,
      isSystem: false,
    },
    {
      id: "developer",
      name: "Developer",
      description: "Development and API access",
      permissions: ["apis.write", "analytics.read", "users.read"],
      userCount: 15,
      isSystem: false,
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Analytics and reporting access",
      permissions: ["analytics.write", "users.read"],
      userCount: 6,
      isSystem: false,
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access",
      permissions: ["users.read", "analytics.read", "apis.read"],
      userCount: 12,
      isSystem: false,
    },
  ])

  const [selectedRole, setSelectedRole] = useState<string>("admin")
  const [searchTerm, setSearchTerm] = useState("")

  const getLevelColor = (level: string) => {
    switch (level) {
      case "read":
        return "bg-green-100 text-green-800"
      case "write":
        return "bg-blue-100 text-blue-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Users":
        return <Users className="h-4 w-4" />
      case "Security":
        return <Shield className="h-4 w-4" />
      case "System":
        return <Settings className="h-4 w-4" />
      default:
        return <Key className="h-4 w-4" />
    }
  }

  const toggleRolePermission = (roleId: string, permissionId: string) => {
    setRoles(
      roles.map((role) => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permissionId)
          return {
            ...role,
            permissions: hasPermission
              ? role.permissions.filter((p) => p !== permissionId)
              : [...role.permissions, permissionId],
          }
        }
        return role
      }),
    )
  }

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedRoleData = roles.find((role) => role.id === selectedRole)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permissions & Roles</h1>
          <p className="text-gray-600">Manage user roles and system permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Permission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Key className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-gray-600 mt-1">System roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-gray-600 mt-1">Available permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter((r) => !r.isSystem).length}</div>
            <p className="text-xs text-gray-600 mt-1">User-defined roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</div>
            <p className="text-xs text-gray-600 mt-1">Assigned to roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Role Management */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role List */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Select a role to manage permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRole === role.id ? "bg-blue-100 border-blue-300 border" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{role.name}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{role.userCount} users</Badge>
                          {role.isSystem && (
                            <Badge variant="secondary" className="ml-1">
                              System
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Permission Assignment */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{selectedRoleData?.name} Permissions</CardTitle>
                <CardDescription>Manage permissions for the {selectedRoleData?.name} role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(
                      filteredPermissions.reduce(
                        (acc, permission) => {
                          if (!acc[permission.category]) {
                            acc[permission.category] = []
                          }
                          acc[permission.category].push(permission)
                          return acc
                        },
                        {} as Record<string, Permission[]>,
                      ),
                    ).map(([category, categoryPermissions]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center space-x-2 font-medium text-gray-900">
                          {getCategoryIcon(category)}
                          <span>{category}</span>
                        </div>
                        <div className="space-y-2 ml-6">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{permission.name}</span>
                                  <Badge className={getLevelColor(permission.level)} variant="outline">
                                    {permission.level}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{permission.description}</p>
                              </div>
                              <Switch
                                checked={selectedRoleData?.permissions.includes(permission.id) || false}
                                onCheckedChange={() => toggleRolePermission(selectedRole, permission.id)}
                                disabled={selectedRoleData?.isSystem}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permission Matrix */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Overview of all roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center">
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-gray-600">{permission.category}</div>
                        </div>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.id} className="text-center">
                          {role.permissions.includes(permission.id) ? (
                            <Badge className="bg-green-100 text-green-800">✓</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-400">
                              -
                            </Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Audit Log</CardTitle>
              <CardDescription>Recent changes to roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Permission Added",
                    details: "Added 'Manage APIs' permission to Developer role",
                    user: "John Doe",
                    timestamp: "2024-01-20 14:30",
                    type: "success",
                  },
                  {
                    action: "Role Created",
                    details: "Created new 'Data Analyst' role with analytics permissions",
                    user: "Jane Smith",
                    timestamp: "2024-01-20 12:15",
                    type: "info",
                  },
                  {
                    action: "Permission Removed",
                    details: "Removed 'User Administration' from Manager role",
                    user: "Mike Johnson",
                    timestamp: "2024-01-20 10:45",
                    type: "warning",
                  },
                ].map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        log.type === "success"
                          ? "bg-green-500"
                          : log.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{log.action}</h4>
                        <span className="text-sm text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600">{log.details}</p>
                      <p className="text-xs text-gray-500">by {log.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
