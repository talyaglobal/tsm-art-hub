"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Clock,
  FileText,
  Users,
  Database,
  Settings,
  Code,
  BarChart3,
  Zap,
  ExternalLink,
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  type: "api" | "user" | "document" | "integration" | "log" | "setting" | "database" | "analytics"
  category: string
  url: string
  lastModified: string
  relevance: number
  tags: string[]
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    let filtered = results

    if (typeFilter !== "all") {
      filtered = filtered.filter((result) => result.type === typeFilter)
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return b.relevance - a.relevance
        case "date":
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredResults(filtered)
  }, [results, typeFilter, sortBy])

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)

    // Add to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))

    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "User Management API",
          description: "RESTful API for managing user accounts, authentication, and permissions",
          type: "api",
          category: "Authentication",
          url: "/apis/user-management",
          lastModified: "2024-01-20",
          relevance: 95,
          tags: ["api", "users", "auth"],
        },
        {
          id: "2",
          title: "John Doe - Senior Developer",
          description: "Senior Software Engineer in the Platform team",
          type: "user",
          category: "Team Members",
          url: "/users/john-doe",
          lastModified: "2024-01-18",
          relevance: 88,
          tags: ["user", "developer", "platform"],
        },
        {
          id: "3",
          title: "API Integration Guide",
          description: "Complete guide for integrating third-party APIs with our platform",
          type: "document",
          category: "Documentation",
          url: "/content/api-integration-guide",
          lastModified: "2024-01-15",
          relevance: 82,
          tags: ["documentation", "integration", "guide"],
        },
        {
          id: "4",
          title: "Slack Integration",
          description: "Connect your workspace with Slack for notifications and updates",
          type: "integration",
          category: "Communications",
          url: "/integrations/slack",
          lastModified: "2024-01-12",
          relevance: 78,
          tags: ["integration", "slack", "notifications"],
        },
        {
          id: "5",
          title: "Database Performance Logs",
          description: "Recent database query performance and optimization logs",
          type: "log",
          category: "System Logs",
          url: "/logs/database-performance",
          lastModified: "2024-01-22",
          relevance: 75,
          tags: ["logs", "database", "performance"],
        },
        {
          id: "6",
          title: "Security Settings",
          description: "Configure security policies, authentication, and access controls",
          type: "setting",
          category: "Security",
          url: "/settings/security",
          lastModified: "2024-01-10",
          relevance: 72,
          tags: ["settings", "security", "access"],
        },
        {
          id: "7",
          title: "Analytics Database",
          description: "Main analytics database containing user behavior and system metrics",
          type: "database",
          category: "Data Storage",
          url: "/data/databases/analytics",
          lastModified: "2024-01-19",
          relevance: 68,
          tags: ["database", "analytics", "metrics"],
        },
        {
          id: "8",
          title: "API Usage Analytics",
          description: "Detailed analytics and metrics for API usage and performance",
          type: "analytics",
          category: "Reports",
          url: "/analytics/api-usage",
          lastModified: "2024-01-21",
          relevance: 65,
          tags: ["analytics", "api", "usage"],
        },
      ]

      // Filter results based on query
      const filtered = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )

      setResults(filtered)
      setIsLoading(false)
    }, 800)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "api":
        return <Code className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "integration":
        return <Zap className="h-4 w-4" />
      case "log":
        return <FileText className="h-4 w-4" />
      case "setting":
        return <Settings className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "analytics":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "api":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-green-100 text-green-800"
      case "document":
        return "bg-purple-100 text-purple-800"
      case "integration":
        return "bg-orange-100 text-orange-800"
      case "log":
        return "bg-gray-100 text-gray-800"
      case "setting":
        return "bg-yellow-100 text-yellow-800"
      case "database":
        return "bg-indigo-100 text-indigo-800"
      case "analytics":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          </div>
          <p className="text-gray-600">Find APIs, users, documents, and more across your workspace</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for APIs, users, documents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 text-lg h-12"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading} className="h-12 px-8">
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(search)
                        handleSearch()
                      }}
                      className="text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="api">APIs</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                        <SelectItem value="integration">Integrations</SelectItem>
                        <SelectItem value="log">Logs</SelectItem>
                        <SelectItem value="setting">Settings</SelectItem>
                        <SelectItem value="database">Databases</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date Modified</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredResults.length} of {results.length} results
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(result.type)}
                            <h3 className="font-semibold text-lg hover:text-blue-600">{result.title}</h3>
                          </div>
                          <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{result.relevance}% match</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{result.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{result.category}</span>
                            <span>•</span>
                            <span>Modified {result.lastModified}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* No Results */}
        {results.length === 0 && query && !isLoading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find anything matching "{query}". Try adjusting your search terms.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Suggestions:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Check your spelling</li>
                  <li>• Try more general terms</li>
                  <li>• Use different keywords</li>
                  <li>• Remove filters to see more results</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {results.length === 0 && !query && !isLoading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-600 mb-6">
                Enter a search term above to find APIs, users, documents, and more across your workspace.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">APIs</p>
                  <p className="text-xs text-gray-500">Search endpoints</p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Users</p>
                  <p className="text-xs text-gray-500">Find team members</p>
                </div>
                <div className="text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-xs text-gray-500">Browse docs</p>
                </div>
                <div className="text-center">
                  <Database className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Data</p>
                  <p className="text-xs text-gray-500">Search databases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
