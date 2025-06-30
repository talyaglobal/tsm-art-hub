"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Star,
  Archive,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw,
} from "lucide-react"

interface Message {
  id: string
  subject: string
  sender: {
    name: string
    email: string
    avatar?: string
  }
  recipients: number
  content: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "draft" | "sent" | "delivered" | "failed"
  timestamp: string
  isRead: boolean
  isStarred: boolean
  hasAttachments: boolean
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("inbox")

  useEffect(() => {
    const loadMessages = () => {
      const mockMessages: Message[] = [
        {
          id: "1",
          subject: "Weekly Team Standup - Action Items",
          sender: { name: "John Doe", email: "john@company.com" },
          recipients: 12,
          content: "Here are the action items from our weekly standup meeting...",
          priority: "high",
          status: "sent",
          timestamp: "2 hours ago",
          isRead: false,
          isStarred: true,
          hasAttachments: true,
        },
        {
          id: "2",
          subject: "New Feature Release Announcement",
          sender: { name: "Sarah Wilson", email: "sarah@company.com" },
          recipients: 45,
          content: "We're excited to announce the release of our new dashboard features...",
          priority: "normal",
          status: "delivered",
          timestamp: "1 day ago",
          isRead: true,
          isStarred: false,
          hasAttachments: false,
        },
        {
          id: "3",
          subject: "Security Update Required",
          sender: { name: "Mike Johnson", email: "mike@company.com" },
          recipients: 8,
          content: "Please update your passwords and enable 2FA...",
          priority: "urgent",
          status: "sent",
          timestamp: "3 days ago",
          isRead: false,
          isStarred: true,
          hasAttachments: true,
        },
        {
          id: "4",
          subject: "Monthly Performance Report",
          sender: { name: "Jane Smith", email: "jane@company.com" },
          recipients: 23,
          content: "Attached is the monthly performance report for review...",
          priority: "normal",
          status: "draft",
          timestamp: "5 days ago",
          isRead: true,
          isStarred: false,
          hasAttachments: true,
        },
        {
          id: "5",
          subject: "Welcome New Team Members",
          sender: { name: "David Brown", email: "david@company.com" },
          recipients: 67,
          content: "Please join me in welcoming our new team members...",
          priority: "low",
          status: "failed",
          timestamp: "1 week ago",
          isRead: true,
          isStarred: false,
          hasAttachments: false,
        },
      ]

      setMessages(mockMessages)
      setFilteredMessages(mockMessages)
      setIsLoading(false)
    }

    setTimeout(loadMessages, 800)
  }, [])

  useEffect(() => {
    let filtered = messages

    // Filter by tab
    if (activeTab === "starred") {
      filtered = filtered.filter((msg) => msg.isStarred)
    } else if (activeTab === "drafts") {
      filtered = filtered.filter((msg) => msg.status === "draft")
    } else if (activeTab === "sent") {
      filtered = filtered.filter((msg) => msg.status === "sent" || msg.status === "delivered")
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((msg) => msg.priority === priorityFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter)
    }

    setFilteredMessages(filtered)
  }, [messages, searchTerm, priorityFilter, statusFilter, activeTab])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="h-4 w-4 text-blue-600" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "draft":
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const toggleStar = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Send and manage team communications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/messages/compose">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.filter((m) => !m.isRead).length}</div>
              <p className="text-xs text-gray-600">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Starred</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.filter((m) => m.isStarred).length}</div>
              <p className="text-xs text-gray-600">Important messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.filter((m) => m.status === "draft").length}</div>
              <p className="text-xs text-gray-600">Unsent messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Your team communications and announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="starred">Starred</TabsTrigger>
                    <TabsTrigger value="drafts">Drafts</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="space-y-4">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                        <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                      </div>
                    ) : (
                      filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                            !message.isRead ? "bg-blue-50 border-blue-200" : "bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {message.sender.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{message.sender.name}</p>
                                <p className="text-xs text-gray-600">{message.sender.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(message.priority)}>{message.priority}</Badge>
                              {getStatusIcon(message.status)}
                              <button
                                onClick={() => toggleStar(message.id)}
                                className={`p-1 rounded ${
                                  message.isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                                }`}
                              >
                                <Star className={`h-4 w-4 ${message.isStarred ? "fill-current" : ""}`} />
                              </button>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h4 className={`font-medium ${!message.isRead ? "font-semibold" : ""}`}>
                              {message.subject}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.content}</p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {message.recipients} recipients
                              </span>
                              {message.hasAttachments && (
                                <span className="flex items-center">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Attachments
                                </span>
                              )}
                            </div>
                            <span>{message.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
