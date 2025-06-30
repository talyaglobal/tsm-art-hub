"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, Plus, Search, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DatabaseTable {
  id: string
  name: string
  database: string
  rows: number
  size: string
  lastModified: string
  type: "table" | "view" | "index"
  status: "active" | "inactive" | "syncing"
}

export default function TablesPage() {
  const [tables] = useState<DatabaseTable[]>([
    {
      id: "1",
      name: "users",
      database: "Primary PostgreSQL",
      rows: 1247,
      size: "45.2 MB",
      lastModified: "2024-01-20 14:30",
      type: "table",
      status: "active",
    },
    {
      id: "2",
      name: "api_logs",
      database: "Analytics MySQL",
      rows: 156789,
      size: "892.1 MB",
      lastModified: "2024-01-20 14:25",
      type: "table",
      status: "active",
    },
    {
      id: "3",
      name: "user_sessions",
      database: "User Data MongoDB",
      rows: 8934,
      size: "23.4 MB",
      lastModified: "2024-01-20 12:15",
      type: "table",
      status: "syncing",
    },
    {
      id: "4",
      name: "cache_keys",
      database: "Cache Redis",
      rows: 45678,
      size: "12.8 MB",
      lastModified: "2024-01-20 14:20",
      type: "table",
      status: "active",
    },
    {
      id: "5",
      name: "user_profile_view",
      database: "Primary PostgreSQL",
      rows: 1247,
      size: "N/A",
      lastModified: "2024-01-19 16:45",
      type: "view",
      status: "active",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterDatabase, setFilterDatabase] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "syncing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "table":
        return "bg-blue-100 text-blue-800"
      case "view":
        return "bg-purple-100 text-purple-800"
      case "index":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDatabase = filterDatabase === "all" || table.database === filterDatabase
    const matchesType = filterType === "all" || table.type === filterType
    return matchesSearch && matchesDatabase && matchesType
  })

  const uniqueDatabases = Array.from(new Set(tables.map((table) => table.database)))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600">View and manage database tables, views, and indexes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Table
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDatabase} onValueChange={setFilterDatabase}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Databases</SelectItem>
                {uniqueDatabases.map((db) => (
                  <SelectItem key={db} value={db}>
                    {db}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="view">Views</SelectItem>
                <SelectItem value="index">Indexes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>
            Showing {filteredTables.length} of {tables.length} tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{table.database}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(table.type)} variant="outline">
                      {table.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{table.rows.toLocaleString()}</TableCell>
                  <TableCell>{table.size}</TableCell>
                  <TableCell>{table.lastModified}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Data
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Schema
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.filter((t) => t.type === "table").length}</div>
            <p className="text-xs text-gray-600 mt-1">Active database tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tables.reduce((sum, table) => sum + table.rows, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Across all tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.filter((t) => t.type === "view").length}</div>
            <p className="text-xs text-gray-600 mt-1">Database views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Syncing</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.filter((t) => t.status === "syncing").length}</div>
            <p className="text-xs text-gray-600 mt-1">Currently syncing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
