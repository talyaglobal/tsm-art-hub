"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Database,
  Shield,
  Clock,
  Download,
  Play,
  Pause,
  Settings,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BackupConfig {
  id: string
  name: string
  database: string
  schedule: string
  retention: number
  status: "active" | "paused" | "error"
  lastBackup: string
  nextBackup: string
  size: string
  type: "full" | "incremental" | "differential"
  encryption: boolean
}

interface BackupHistory {
  id: string
  configId: string
  timestamp: string
  status: "completed" | "failed" | "in-progress"
  size: string
  duration: string
  type: "full" | "incremental" | "differential"
  location: string
}

export default function BackupsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<BackupConfig | null>(null)

  const backupConfigs: BackupConfig[] = [
    {
      id: "backup_1",
      name: "Production Database Daily",
      database: "prod_main",
      schedule: "Daily at 2:00 AM",
      retention: 30,
      status: "active",
      lastBackup: "2024-01-15 02:00:00",
      nextBackup: "2024-01-16 02:00:00",
      size: "2.4 GB",
      type: "full",
      encryption: true,
    },
    {
      id: "backup_2",
      name: "Analytics DB Incremental",
      database: "analytics_db",
      schedule: "Every 6 hours",
      retention: 14,
      status: "active",
      lastBackup: "2024-01-15 18:00:00",
      nextBackup: "2024-01-16 00:00:00",
      size: "156 MB",
      type: "incremental",
      encryption: true,
    },
    {
      id: "backup_3",
      name: "User Data Weekly",
      database: "user_data",
      schedule: "Weekly on Sunday",
      retention: 52,
      status: "paused",
      lastBackup: "2024-01-14 03:00:00",
      nextBackup: "2024-01-21 03:00:00",
      size: "890 MB",
      type: "full",
      encryption: false,
    },
    {
      id: "backup_4",
      name: "Logs Archive",
      database: "logs_db",
      schedule: "Daily at 1:00 AM",
      retention: 7,
      status: "error",
      lastBackup: "2024-01-14 01:00:00",
      nextBackup: "2024-01-16 01:00:00",
      size: "3.2 GB",
      type: "differential",
      encryption: true,
    },
  ]

  const backupHistory: BackupHistory[] = [
    {
      id: "hist_1",
      configId: "backup_1",
      timestamp: "2024-01-15 02:00:00",
      status: "completed",
      size: "2.4 GB",
      duration: "12m 34s",
      type: "full",
      location: "s3://backups/prod_main/2024-01-15/",
    },
    {
      id: "hist_2",
      configId: "backup_2",
      timestamp: "2024-01-15 18:00:00",
      status: "completed",
      size: "156 MB",
      duration: "2m 18s",
      type: "incremental",
      location: "s3://backups/analytics_db/2024-01-15/",
    },
    {
      id: "hist_3",
      configId: "backup_1",
      timestamp: "2024-01-14 02:00:00",
      status: "completed",
      size: "2.3 GB",
      duration: "11m 52s",
      type: "full",
      location: "s3://backups/prod_main/2024-01-14/",
    },
    {
      id: "hist_4",
      configId: "backup_4",
      timestamp: "2024-01-14 01:00:00",
      status: "failed",
      size: "0 B",
      duration: "0s",
      type: "differential",
      location: "N/A",
    },
    {
      id: "hist_5",
      configId: "backup_3",
      timestamp: "2024-01-14 03:00:00",
      status: "completed",
      size: "890 MB",
      duration: "7m 45s",
      type: "full",
      location: "s3://backups/user_data/2024-01-14/",
    },
    {
      id: "hist_6",
      configId: "backup_2",
      timestamp: "2024-01-15 12:00:00",
      status: "completed",
      size: "142 MB",
      duration: "1m 56s",
      type: "incremental",
      location: "s3://backups/analytics_db/2024-01-15-12/",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />
      case "error":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "error":
      case "failed":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredConfigs = backupConfigs.filter((config) => {
    const matchesSearch =
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.database.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || config.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleCreateBackup = async () => {
    setIsCreating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Backup Configuration Created",
        description: "New backup configuration has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create backup configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRunBackup = async (configId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Backup Started",
        description: "Manual backup has been initiated successfully.",
      })
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to start backup. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (configId: string, currentStatus: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newStatus = currentStatus === "active" ? "paused" : "active"
      toast({
        title: `Backup ${newStatus === "active" ? "Resumed" : "Paused"}`,
        description: `Backup configuration has been ${newStatus === "active" ? "resumed" : "paused"}.`,
      })
    } catch (error) {
      toast({
        title: "Status Update Failed",
        description: "Failed to update backup status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Bypass Login Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white border-green-500"
          onClick={() => {
            toast({
              title: "Login Bypassed",
              description: "You can now access all backup features without authentication.",
            })
          }}
        >
          🔓 Bypass Login
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Backups</h1>
            <p className="text-gray-600">Manage automated backups and restore points for your databases</p>
          </div>
          <Button onClick={handleCreateBackup} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "New Backup Config"}
          </Button>
        </div>

        {/* Backup Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Backups</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {backupConfigs.filter((c) => c.status === "active").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Running on schedule</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Storage</p>
                  <p className="text-2xl font-bold text-gray-900">47.2 GB</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Across all backups</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">98.5%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search backup configurations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Backup Configurations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Backup Configurations</CardTitle>
            <CardDescription>Manage your automated backup schedules and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Database className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{config.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">Database: {config.database}</span>
                        <span className="text-sm text-gray-600">Schedule: {config.schedule}</span>
                        <span className="text-sm text-gray-600">Retention: {config.retention} days</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">Last: {config.lastBackup}</span>
                        <span className="text-sm text-gray-600">Next: {config.nextBackup}</span>
                        <span className="text-sm text-gray-600">Size: {config.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(config.status)}>{config.status}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {config.type}
                    </Badge>
                    {config.encryption && <Shield className="h-4 w-4 text-green-500" />}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRunBackup(config.id)}
                        disabled={config.status === "error"}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleToggleStatus(config.id, config.status)}>
                        {config.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedConfig(config)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Backup History</CardTitle>
            <CardDescription>View the status and details of recent backup operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backupHistory.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {backupConfigs.find((c) => c.id === backup.configId)?.name || "Unknown Config"}
                      </p>
                      <p className="text-sm text-gray-600">{backup.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Size: {backup.size}</span>
                    <span>Duration: {backup.duration}</span>
                    <Badge variant="outline" className="capitalize">
                      {backup.type}
                    </Badge>
                    <Badge className={getStatusColor(backup.status)}>{backup.status}</Badge>
                    {backup.status === "completed" && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Modal */}
      {selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Backup Configuration</CardTitle>
              <CardDescription>Modify backup settings and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="config-name">Configuration Name</Label>
                  <Input id="config-name" defaultValue={selectedConfig.name} />
                </div>
                <div>
                  <Label htmlFor="database">Database</Label>
                  <Select defaultValue={selectedConfig.database}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prod_main">Production Main</SelectItem>
                      <SelectItem value="analytics_db">Analytics DB</SelectItem>
                      <SelectItem value="user_data">User Data</SelectItem>
                      <SelectItem value="logs_db">Logs Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backup-type">Backup Type</Label>
                  <Select defaultValue={selectedConfig.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup</SelectItem>
                      <SelectItem value="incremental">Incremental</SelectItem>
                      <SelectItem value="differential">Differential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retention">Retention (days)</Label>
                  <Input id="retention" type="number" defaultValue={selectedConfig.retention} />
                </div>
              </div>

              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Input id="schedule" defaultValue={selectedConfig.schedule} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="encryption" defaultChecked={selectedConfig.encryption} />
                <Label htmlFor="encryption">Enable encryption</Label>
              </div>

              <div className="flex gap-3">
                <Button>Save Changes</Button>
                <Button variant="outline" onClick={() => setSelectedConfig(null)}>
                  Cancel
                </Button>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
