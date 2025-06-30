"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, LineChartIcon, PieChartIcon, Activity, TrendingUp, Download, RefreshCw } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts"

const apiPerformanceData = [
  { time: "00:00", shopify: 145, stripe: 123, quickbooks: 167, wms: 134 },
  { time: "04:00", shopify: 132, stripe: 145, quickbooks: 156, wms: 128 },
  { time: "08:00", shopify: 178, stripe: 167, quickbooks: 189, wms: 145 },
  { time: "12:00", shopify: 234, stripe: 198, quickbooks: 245, wms: 167 },
  { time: "16:00", shopify: 189, stripe: 176, quickbooks: 198, wms: 156 },
  { time: "20:00", shopify: 156, stripe: 145, quickbooks: 167, wms: 134 },
]

const requestVolumeData = [
  { time: "00:00", requests: 1200 },
  { time: "04:00", requests: 800 },
  { time: "08:00", requests: 2400 },
  { time: "12:00", requests: 3200 },
  { time: "16:00", requests: 2800 },
  { time: "20:00", requests: 1600 },
]

const errorDistributionData = [
  { name: "4xx Client Errors", value: 65, color: "#F59E0B" },
  { name: "5xx Server Errors", value: 25, color: "#EF4444" },
  { name: "Timeout Errors", value: 8, color: "#8B5CF6" },
  { name: "Network Errors", value: 2, color: "#6B7280" },
]

const userEngagementData = [
  { name: "Daily Active", value: 85, color: "#10B981" },
  { name: "Weekly Active", value: 65, color: "#3B82F6" },
  { name: "Monthly Active", value: 45, color: "#F59E0B" },
]

const apiUsageData = [
  { api: "Shopify", jan: 45000, feb: 52000, mar: 48000 },
  { api: "Stripe", jan: 38000, feb: 42000, mar: 45000 },
  { api: "QuickBooks", jan: 28000, feb: 31000, mar: 29000 },
  { api: "WMS Pro", jan: 22000, feb: 25000, mar: 28000 },
  { api: "Chase Bank", jan: 15000, feb: 18000, mar: 19000 },
]

export default function AnalyticsChartsPage() {
  const [timeRange, setTimeRange] = useState("24h")
  const [chartType, setChartType] = useState("all")

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Charts</h1>
          <p className="text-gray-600">Visual data representations and interactive charts</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Chart Categories */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Performance Charts */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChartIcon className="h-5 w-5" />
                  <span>API Response Times</span>
                </CardTitle>
                <CardDescription>Response time trends by API endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="shopify" stroke="#3B82F6" name="Shopify" />
                    <Line type="monotone" dataKey="stripe" stroke="#10B981" name="Stripe" />
                    <Line type="monotone" dataKey="quickbooks" stroke="#F59E0B" name="QuickBooks" />
                    <Line type="monotone" dataKey="wms" stroke="#8B5CF6" name="WMS Pro" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Request Volume</span>
                </CardTitle>
                <CardDescription>API request volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={requestVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="requests" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Charts */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>API Usage Comparison</span>
                </CardTitle>
                <CardDescription>Monthly API usage by service</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={apiUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="api" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jan" fill="#3B82F6" name="January" />
                    <Bar dataKey="feb" fill="#10B981" name="February" />
                    <Bar dataKey="mar" fill="#F59E0B" name="March" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>User Engagement</span>
                </CardTitle>
                <CardDescription>User activity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={userEngagementData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Error Charts */}
        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Error Distribution</span>
                </CardTitle>
                <CardDescription>Breakdown of error types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {errorDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate Trends</CardTitle>
                <CardDescription>Error rates over time by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-900">Critical Errors</div>
                      <div className="text-sm text-red-700">0.02% of total requests</div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">2</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-900">Warning Errors</div>
                      <div className="text-sm text-yellow-700">0.08% of total requests</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">8</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-900">Info Errors</div>
                      <div className="text-sm text-blue-700">0.12% of total requests</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">12</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Charts */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>User registration and activity trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[
                      { month: "Jan", newUsers: 120, activeUsers: 890 },
                      { month: "Feb", newUsers: 156, activeUsers: 1020 },
                      { month: "Mar", newUsers: 189, activeUsers: 1180 },
                      { month: "Apr", newUsers: 145, activeUsers: 1247 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#10B981" fill="#10B981" />
                    <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>User retention rates by cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Day 1 Retention</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Day 7 Retention</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Day 30 Retention</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
