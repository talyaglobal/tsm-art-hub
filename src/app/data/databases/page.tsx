"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Database,
  Plus,
  Search,
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  Activity,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Grid3X3,
  List,
  Monitor,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface DatabaseConnection {
  id: string
  name: string
  type: "postgresql" | "mysql" | "mongodb" | "redis" | "elasticsearch"
  host: string
  status: "connected" | "disconnected" | "error"
  connections: number
  maxConnections: number
  size: string
  lastBackup: string
  uptime: string
  port: number
  version: string
  region: string
}

export default function DatabasesPage() {
  const [databases] = useState<DatabaseConnection[]>([
    {
      id: "1",
      name: "Primary PostgreSQL",
      type: "postgresql",
      host: "db-primary.tsmarthub.com",
      status: "connected",
      connections: 45,
      maxConnections: 100,
      size: "2.4 GB",
      lastBackup: "2 hours ago",
      uptime: "99.9%",
      port: 5432,
      version: "14.2",
      region: "us-east-1",
    },
    {
      id: "2",
      name: "Analytics MySQL",
      type: "mysql",
      host: "analytics-db.tsmarthub.com",
      status: "connected",
      connections: 23,
      maxConnections: 50,
      size: "1.8 GB",
      lastBackup: "4 hours ago",
      uptime: "99.7%",
      port: 3306,
      version: "8.0.28",
      region: "us-west-2",
    },
    {
      id: "3",
      name: "User Data MongoDB",
      type: "mongodb",
      host: "mongo-cluster.tsmarthub.com",
      status: "error",
      connections: 0,
      maxConnections: 200,
      size: "3.2 GB",
      lastBackup: "1 day ago",
      uptime: "98.5%",
      port: 27017,
      version: "5.0.6",
      region: "eu-west-1",
    },
    {
      id: "4",
      name: "Cache Redis",
      type: "redis",
      host: "redis-cache.tsmarthub.com",
      status: "connected",
      connections: 156,
      maxConnections: 1000,
      size: "512 MB",
      lastBackup: "1 hour ago",
      uptime: "99.8%",
      port: 6379,
      version: "6.2.6",
      region: "us-east-1",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800"
      case "disconnected":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    return <Database className="h-5 w-5 text-blue-600" />
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "postgresql":
        return "bg-blue-100 text-blue-800"
      case "mysql":
        return "bg-orange-100 text-orange-800"
      case "mongodb":
        return "bg-green-100 text-green-800"
      case "redis":
        return "bg-red-100 text-red-800"
      case "elasticsearch":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDatabases = databases.filter(
    (db) =>
      db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600">Monitor and manage your database connections</p>
        </div>
        <Link href="/data/databases/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Database
          </Button>
        </Link>
      </div>

      {/* Search and View Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Views */}
      {viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDatabases.map((db) => (
            <Card key={db.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(db.type)}
                    <div>
                      <CardTitle className="text-lg">{db.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {db.host}:{db.port}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(db.status)}
                    <Badge className={getStatusColor(db.status)}>{db.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/data/databases/${db.id}/configure`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/data/databases/${db.id}/monitor`}>
                            <Activity className="h-4 w-4 mr-2" />
                            Monitor
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {db.status === "connected" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Disconnect
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Database Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <Badge variant="outline" className={`capitalize ${getTypeColor(db.type)}`}>
                      {db.type}
                    </Badge>
                  </div>

                  {/* Connection Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Connections</span>
                      <span className="text-sm font-medium">
                        {db.connections} / {db.maxConnections}
                      </span>
                    </div>
                    <Progress value={(db.connections / db.maxConnections) * 100} className="h-2" />
                  </div>

                  {/* Database Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-500 mb-1">
                        <HardDrive className="h-3 w-3" />
                        <span>Size</span>
                      </div>
                      <p className="font-medium">{db.size}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-500 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>Backup</span>
                      </div>
                      <p className="font-medium">{db.lastBackup}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-500 mb-1">
                        <Activity className="h-3 w-3" />
                        <span>Uptime</span>
                      </div>
                      <p className="font-medium">{db.uptime}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/data/databases/${db.id}/monitor`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Activity className="h-4 w-4 mr-2" />
                        Monitor
                      </Button>
                    </Link>
                    <Link href={`/data/databases/${db.id}/configure`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>Database Connections</CardTitle>
            <CardDescription>Detailed list view of all database connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Database</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connections</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatabases.map((db) => (
                    <TableRow key={db.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(db.type)}
                          <div>
                            <div className="font-medium">{db.name}</div>
                            <div className="text-sm text-gray-500 font-mono">
                              {db.host}:{db.port}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getTypeColor(db.type)}`}>
                          {db.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(db.status)}
                          <Badge className={getStatusColor(db.status)}>{db.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {db.connections} / {db.maxConnections}
                          </div>
                          <Progress value={(db.connections / db.maxConnections) * 100} className="h-1 w-16" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{db.size}</TableCell>
                      <TableCell className="font-medium">{db.uptime}</TableCell>
                      <TableCell className="font-mono text-sm">{db.version}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{db.region}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/data/databases/${db.id}/monitor`}>
                            <Button variant="outline" size="sm">
                              <Monitor className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Monitor</span>
                            </Button>
                          </Link>
                          <Link href={`/data/databases/${db.id}/configure`}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Configure</span>
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                {db.status === "connected" ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Disconnect
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Connect
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Database Summary</CardTitle>
          <CardDescription>Overview of all database connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {databases.filter((db) => db.status === "connected").length}
              </div>
              <div className="text-sm text-gray-600">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {databases.filter((db) => db.status === "error").length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {databases.reduce((sum, db) => sum + db.connections, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{databases.length}</div>
              <div className="text-sm text-gray-600">Total Databases</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
