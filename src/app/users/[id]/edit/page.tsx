"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Upload, User, Mail, Phone, MapPin, Briefcase, Shield } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface UserEditData {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: string
  department: string
  title: string
  location: string
  bio: string
  permissions: string[]
  status: string
}

export default function EditUserPage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<UserEditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
        bio: "Experienced software engineer with expertise in full-stack development and team leadership.",
        permissions: ["read", "write", "admin"],
        status: "active",
      })
      setIsLoading(false)
    }

    setTimeout(loadUser, 600)
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSaving(false)
    // Show success message or redirect
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (!user) return

    setUser({
      ...user,
      permissions: checked ? [...user.permissions, permission] : user.permissions.filter((p) => p !== permission),
    })
  }

  const availablePermissions = [
    { id: "read", label: "Read Access", description: "Can view data and information" },
    { id: "write", label: "Write Access", description: "Can create and modify data" },
    { id: "admin", label: "Admin Access", description: "Full administrative privileges" },
    { id: "delete", label: "Delete Access", description: "Can delete data and records" },
    { id: "manage_users", label: "Manage Users", description: "Can manage other users" },
    { id: "view_analytics", label: "View Analytics", description: "Can access analytics and reports" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
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
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <Link href="/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
              <p className="text-gray-600">Update user information and permissions</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update the user's profile image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Picture
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Personal and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input id="phone" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={user.location}
                    onChange={(e) => setUser({ ...user, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={user.bio}
                  onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  placeholder="Brief description about the user..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle>Work Information</CardTitle>
              <CardDescription>Job title, department, and role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Job Title
                  </Label>
                  <Input id="title" value={user.title} onChange={(e) => setUser({ ...user, title: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={user.department} onValueChange={(value) => setUser({ ...user, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="role">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Role *
                  </Label>
                  <Select value={user.role} onValueChange={(value) => setUser({ ...user, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={user.status} onValueChange={(value) => setUser({ ...user, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Manage user access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={permission.id}
                      checked={user.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                        {permission.label}
                      </Label>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Permissions Display */}
          <Card>
            <CardHeader>
              <CardTitle>Current Permissions</CardTitle>
              <CardDescription>Active permissions for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="bg-blue-100 text-blue-800">
                    {permission.replace("_", " ").toUpperCase()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href={`/users/${userId}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                "Saving Changes..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
