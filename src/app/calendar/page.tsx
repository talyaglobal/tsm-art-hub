"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Plus, Clock, Users, MapPin, Video, RefreshCw, Filter } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  type: "meeting" | "deadline" | "reminder" | "event"
  attendees: Array<{
    name: string
    email: string
    avatar?: string
  }>
  location?: string
  isVirtual: boolean
  status: "confirmed" | "tentative" | "cancelled"
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEvents = () => {
      const mockEvents: CalendarEvent[] = [
        {
          id: "1",
          title: "Weekly Team Standup",
          description: "Regular team sync and progress updates",
          start: new Date(2024, 0, 25, 9, 0),
          end: new Date(2024, 0, 25, 10, 0),
          type: "meeting",
          attendees: [
            { name: "John Doe", email: "john@company.com" },
            { name: "Jane Smith", email: "jane@company.com" },
            { name: "Mike Johnson", email: "mike@company.com" },
          ],
          isVirtual: true,
          status: "confirmed",
        },
        {
          id: "2",
          title: "Product Launch Deadline",
          description: "Final deadline for product launch preparations",
          start: new Date(2024, 0, 28, 17, 0),
          end: new Date(2024, 0, 28, 17, 0),
          type: "deadline",
          attendees: [],
          isVirtual: false,
          status: "confirmed",
        },
        {
          id: "3",
          title: "Client Presentation",
          description: "Quarterly business review with key client",
          start: new Date(2024, 0, 30, 14, 0),
          end: new Date(2024, 0, 30, 16, 0),
          type: "meeting",
          attendees: [
            { name: "Sarah Wilson", email: "sarah@company.com" },
            { name: "David Brown", email: "david@company.com" },
          ],
          location: "Conference Room A",
          isVirtual: false,
          status: "confirmed",
        },
        {
          id: "4",
          title: "Security Audit Review",
          description: "Monthly security audit and compliance review",
          start: new Date(2024, 1, 2, 11, 0),
          end: new Date(2024, 1, 2, 12, 30),
          type: "meeting",
          attendees: [{ name: "Mike Johnson", email: "mike@company.com" }],
          isVirtual: true,
          status: "tentative",
        },
        {
          id: "5",
          title: "Team Building Event",
          description: "Quarterly team building and social event",
          start: new Date(2024, 1, 5, 18, 0),
          end: new Date(2024, 1, 5, 21, 0),
          type: "event",
          attendees: [
            { name: "John Doe", email: "john@company.com" },
            { name: "Jane Smith", email: "jane@company.com" },
            { name: "Mike Johnson", email: "mike@company.com" },
            { name: "Sarah Wilson", email: "sarah@company.com" },
          ],
          location: "Downtown Restaurant",
          isVirtual: false,
          status: "confirmed",
        },
      ]

      setEvents(mockEvents)
      setIsLoading(false)
    }

    setTimeout(loadEvents, 800)
  }, [])

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800"
      case "deadline":
        return "bg-red-100 text-red-800"
      case "reminder":
        return "bg-yellow-100 text-yellow-800"
      case "event":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "tentative":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter((event) => event.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5)
  }

  const getTodayEvents = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return events.filter((event) => event.start >= today && event.start < tomorrow)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
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
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">Manage your schedule and events</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTodayEvents().length}</div>
              <p className="text-xs text-gray-600">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  events.filter((event) => {
                    const weekStart = new Date()
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                    const weekEnd = new Date(weekStart)
                    weekEnd.setDate(weekEnd.getDate() + 7)
                    return event.start >= weekStart && event.start < weekEnd
                  }).length
                }
              </div>
              <p className="text-xs text-gray-600">Events this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter((e) => e.type === "meeting").length}</div>
              <p className="text-xs text-gray-600">Total meetings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Virtual Events</CardTitle>
              <Video className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter((e) => e.isVirtual).length}</div>
              <p className="text-xs text-gray-600">Online events</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>{formatDate(new Date())}</CardDescription>
              </CardHeader>
              <CardContent>
                {getTodayEvents().length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events today</h3>
                    <p className="text-gray-600">Your schedule is clear for today.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getTodayEvents().map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(event.start)} - {formatTime(event.end)}
                            </span>
                            {event.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </span>
                            )}
                            {event.isVirtual && (
                              <span className="flex items-center">
                                <Video className="h-4 w-4 mr-1" />
                                Virtual
                              </span>
                            )}
                          </div>
                          {event.attendees.length > 0 && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{event.attendees.length} attendees</span>
                            </div>
                          )}
                        </div>

                        {event.attendees.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            <span className="text-sm text-gray-600">Attendees:</span>
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 3).map((attendee, index) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                  <AvatarImage src={attendee.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {attendee.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {event.attendees.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                  <span className="text-xs text-gray-600">+{event.attendees.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Next 5 scheduled events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingEvents().map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{event.title}</h5>
                        <Badge className={getEventTypeColor(event.type)} variant="secondary">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{formatDate(event.start)}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(event.start)}
                        {event.attendees.length > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees.length}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Team Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  View Month
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
