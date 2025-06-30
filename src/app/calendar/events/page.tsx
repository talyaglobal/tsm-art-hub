"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CalendarCheck, Plus, Search, Clock, Users, MapPin, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: string
  type: "meeting" | "webinar" | "workshop" | "conference" | "other"
  location: string
  attendees: number
  maxAttendees?: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  organizer: string
  priority: "low" | "medium" | "high"
}

export default function EventsPage() {
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "API Integration Workshop",
      description: "Hands-on workshop covering API integration best practices",
      date: "2024-01-25",
      time: "10:00 AM",
      duration: "2 hours",
      type: "workshop",
      location: "Conference Room A",
      attendees: 15,
      maxAttendees: 20,
      status: "upcoming",
      organizer: "John Doe",
      priority: "high",
    },
    {
      id: "2",
      title: "Monthly Team Standup",
      description: "Regular team sync and project updates",
      date: "2024-01-22",
      time: "9:00 AM",
      duration: "1 hour",
      type: "meeting",
      location: "Virtual - Zoom",
      attendees: 12,
      maxAttendees: 15,
      status: "completed",
      organizer: "Jane Smith",
      priority: "medium",
    },
    {
      id: "3",
      title: "Product Launch Webinar",
      description: "Introducing new features and capabilities",
      date: "2024-01-28",
      time: "2:00 PM",
      duration: "1.5 hours",
      type: "webinar",
      location: "Online",
      attendees: 89,
      maxAttendees: 100,
      status: "upcoming",
      organizer: "Mike Johnson",
      priority: "high",
    },
    {
      id: "4",
      title: "Security Review Meeting",
      description: "Quarterly security assessment and planning",
      date: "2024-01-24",
      time: "3:00 PM",
      duration: "2 hours",
      type: "meeting",
      location: "Conference Room B",
      attendees: 8,
      maxAttendees: 10,
      status: "upcoming",
      organizer: "Sarah Wilson",
      priority: "high",
    },
    {
      id: "5",
      title: "Developer Conference 2024",
      description: "Annual developer conference with industry experts",
      date: "2024-02-15",
      time: "9:00 AM",
      duration: "Full day",
      type: "conference",
      location: "Convention Center",
      attendees: 245,
      maxAttendees: 300,
      status: "upcoming",
      organizer: "Event Team",
      priority: "medium",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800"
      case "webinar":
        return "bg-green-100 text-green-800"
      case "workshop":
        return "bg-purple-100 text-purple-800"
      case "conference":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || event.type === filterType
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const upcomingEvents = events.filter((event) => event.status === "upcoming").length
  const totalAttendees = events.reduce((sum, event) => sum + event.attendees, 0)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage and track upcoming events and meetings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-gray-600 mt-1">All events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-gray-600 mt-1">Events scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-gray-600 mt-1">Registered participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-600 mt-1">Events this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <Badge className={getTypeColor(event.type)} variant="outline">
                      {event.type}
                    </Badge>
                    <Badge className={getStatusColor(event.status)} variant="outline">
                      {event.status}
                    </Badge>
                    <Badge className={getPriorityColor(event.priority)} variant="outline">
                      {event.priority} priority
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{event.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {event.time} ({event.duration})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        {event.attendees}
                        {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Organized by {event.organizer}</span>
                    {event.maxAttendees && (
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((event.attendees / event.maxAttendees) * 100)}% full
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Attendees
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common event management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Create Webinar
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CalendarCheck className="h-6 w-6 mb-2" />
              Book Workshop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
