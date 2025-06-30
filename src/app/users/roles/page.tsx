"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Users, Shield, Crown, Key, Settings, Eye, ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  color: string
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export default function UserRolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access with all permissions",
      permissions: ["read", "write", "delete", "admin", "manage_users", "system_config"],
      userCount: 3,
      isSystem: true,
      color: "red",
      createdAt: "2023-01-01",
    },
    {
      id: "manager",
      name: "Manager",
      description: "Management level access with team oversight",
      permissions: ["read", "write", "manage_users", "view_analytics"],
      userCount: 8,
      isSystem: false,
      color: "blue",
      createdAt: "2023-02-15",
    },
    {
      id: "developer",
      name: "Developer",
      description: "Development access with API and code permissions",
      permissions: ["read", "write", "api_access", "deploy"],
      userCount: 15,
      isSystem: false,
      color: "green",
      createdAt: "2023-03-10",
    },
    {
      id: "analyst",
      name: "Data Analyst",
      description: "Analytics and reporting access",
      permissions: ["read", "view_analytics", "export_data"],
      userCount: 6,
      isSystem: false,
      color: "purple",
      createdAt: "2023-04-05",
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to basic information",
      permissions: ["read"],
      userCount: 12,
      isSystem: true,
      color: "gray",
      createdAt: "2023-01-01",
    },
  ])

  const [permissions] = useState<Permission[]>([
    { id: "read", name: "Read Access", description: "View data and information", category: "Basic" },
    { id: "write", name: "Write Access", description: "Create and modify data", category: "Basic" },
    { id: "delete", name: "Delete Access", description: "Remove data and records", category: "Basic" },
    { id: "admin", name: "Admin Access", description: "Administrative privileges", category: "Admin" },
    { id: "manage_users", name: "Manage Users", description: "User management capabilities", category: "Admin" },
    { id: "system_config", name: "System Config", description: "System configuration access", category: "Admin" },
    {
      id: "view_analytics",
      name: "View Analytics",
      description: "Access to analytics and reports",
      category: "Analytics",
    },
    { id: "export_data", name: "Export Data", description: "Export data capabilities", category: "Analytics" },
    { id: "api_access", name: "API Access", description: "Access to API endpoints", category: "Development" },
    { id: "deploy", name: "Deploy", description: "Deployment capabilities", category: "Development" },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    color: "blue",
  })

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "administrator":
        return <Crown className="h-4 w-4" />
      case "manager":
        return <Shield className="h-4 w-4" />
      default:
        return <Key className="h-4 w-4" />
    }
  }

  const getRoleColor = (color: string) => {
    const colors = {
      red: "bg-red-100 text-red-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      gray: "bg-gray-100 text-gray-800",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return

    const role: Role = {
      id: newRole.name.toLowerCase().replace(/\s+/g, "_"),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      userCount: 0,
      isSystem: false,
      color: newRole.color,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setRoles([...roles, role])
    setNewRole({ name: "", description: "", permissions: [], color: "blue" })
    setIsCreating(false)
  }

  const handleDeleteRole = (roleId: string) => {
    if (roles.find((r) => r.id === roleId)?.isSystem) {
      alert("Cannot delete system roles")
      return
    }
    setRoles(roles.filter((r) => r.id !== roleId))
  }

  const handlePermissionToggle = (permissionId: string, isNewRole = false) => {
    if (isNewRole) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.includes(permissionId)
          ? newRole.permissions.filter((p) => p !== permissionId)
          : [...newRole.permissions, permissionId],
      })
    } else if (editingRole) {
      setEditingRole({
        ...editingRole,
        permissions: editingRole.permissions.includes(permissionId)
          ? editingRole.permissions.filter((p) => p !== permissionId)
          : [...editingRole.permissions, permissionId],
      })
    }
  }

  const handleSaveEdit = () => {
    if (!editingRole) return
    setRoles(roles.map((r) => (r.id === editingRole.id ? editingRole : r)))
    setEditingRole(null)
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const permissionsByCategory = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

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
              <h1 className="text-3xl font-bold text-gray-900">User Roles Management</h1>
              <p className="text-gray-600">Create and manage user roles and permissions</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custom Roles</p>
                  <p className="text-2xl font-bold text-green-600">{roles.filter((r) => !r.isSystem).length}</p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-purple-600">{roles.reduce((sum, r) => sum + r.userCount, 0)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permissions</p>
                  <p className="text-2xl font-bold text-orange-600">{permissions.length}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">Roles Management</TabsTrigger>
            <TabsTrigger value="permissions">Permissions Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Roles Table */}
            <Card>
              <CardHeader>
                <CardTitle>Roles ({filteredRoles.length})</CardTitle>
                <CardDescription>Manage user roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getRoleIcon(role.name)}
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getRoleColor(role.color)}>{role.name}</Badge>
                                {role.isSystem && (
                                  <Badge variant="outline" className="text-xs">
                                    System
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={role.description}>
                            {role.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.userCount} users</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{role.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingRole(role)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!role.isSystem && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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
                <CardTitle>Permissions Overview</CardTitle>
                <CardDescription>All available permissions organized by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{permission.name}</h4>
                              <Badge variant="outline">{permission.id}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Role Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Role</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe this role's purpose"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-4 mt-2">
                    {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2 ml-4">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={`new-${permission.id}`}
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id, true)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={`new-${permission.id}`} className="font-medium cursor-pointer">
                                  {permission.name}
                                </Label>
                                <p className="text-sm text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Role Modal */}
        {editingRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Role: {editingRole.name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingRole(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="editRoleName">Role Name *</Label>
                  <Input
                    id="editRoleName"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    disabled={editingRole.isSystem}
                  />
                </div>

                <div>
                  <Label htmlFor="editRoleDescription">Description</Label>
                  <Textarea
                    id="editRoleDescription"
                    value={editingRole.description}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-4 mt-2">
                    {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2 ml-4">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={`edit-${permission.id}`}
                                checked={editingRole.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                disabled={editingRole.isSystem}
                              />
                              <div className="flex-1">
                                <Label htmlFor={`edit-${permission.id}`} className="font-medium cursor-pointer">
                                  {permission.name}
                                </Label>
                                <p className="text-sm text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setEditingRole(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
