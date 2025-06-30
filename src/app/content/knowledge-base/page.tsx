"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Eye,
  ThumbsUp,
  MessageCircle,
  Edit,
  MoreHorizontal,
  Filter,
  TrendingUp,
  Clock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Article {
  id: string
  title: string
  category: string
  author: string
  content: string
  views: number
  likes: number
  comments: number
  rating: number
  status: "published" | "draft" | "review"
  createdAt: string
  lastModified: string
  tags: string[]
}

export default function KnowledgeBasePage() {
  const [articles] = useState<Article[]>([
    {
      id: "1",
      title: "Getting Started with API Integration",
      category: "API Documentation",
      author: "John Doe",
      content: "Learn how to integrate with our API platform...",
      views: 1247,
      likes: 89,
      comments: 23,
      rating: 4.8,
      status: "published",
      createdAt: "2024-01-15",
      lastModified: "2024-01-20",
      tags: ["api", "integration", "getting-started"],
    },
    {
      id: "2",
      title: "Troubleshooting Common Issues",
      category: "Support",
      author: "Jane Smith",
      content: "Solutions to frequently encountered problems...",
      views: 892,
      likes: 67,
      comments: 15,
      rating: 4.6,
      status: "published",
      createdAt: "2024-01-10",
      lastModified: "2024-01-18",
      tags: ["troubleshooting", "support", "faq"],
    },
    {
      id: "3",
      title: "Advanced Analytics Features",
      category: "Analytics",
      author: "Mike Johnson",
      content: "Deep dive into advanced analytics capabilities...",
      views: 456,
      likes: 34,
      comments: 8,
      rating: 4.5,
      status: "draft",
      createdAt: "2024-01-12",
      lastModified: "2024-01-19",
      tags: ["analytics", "advanced", "features"],
    },
    {
      id: "4",
      title: "Security Best Practices",
      category: "Security",
      author: "Sarah Wilson",
      content: "Essential security guidelines and recommendations...",
      views: 678,
      likes: 45,
      comments: 12,
      rating: 4.9,
      status: "published",
      createdAt: "2024-01-08",
      lastModified: "2024-01-17",
      tags: ["security", "best-practices", "guidelines"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = Array.from(new Set(articles.map((article) => article.category)))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Help articles, guides, and documentation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Knowledge Base Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-xs text-gray-600 mt-1">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">All time views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(articles.reduce((sum, article) => sum + article.rating, 0) / articles.length).toFixed(1)}
            </div>
            <p className="text-xs text-gray-600 mt-1">User satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-gray-600 mt-1">Article categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles, guides, and documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">All Articles</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        {/* All Articles */}
        <TabsContent value="articles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                      <CardDescription>{article.content.substring(0, 100)}...</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{article.category}</Badge>
                      <Badge className={getStatusColor(article.status)} variant="outline">
                        {article.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>by {article.author}</span>
                      <span>{article.lastModified}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{article.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Popular Articles */}
        <TabsContent value="popular" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Most Popular Articles</span>
              </CardTitle>
              <CardDescription>Articles with the highest view counts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-gray-600">
                        {article.category} • by {article.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Articles */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recently Updated</span>
              </CardTitle>
              <CardDescription>Latest articles and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div key={article.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{article.content.substring(0, 120)}...</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>by {article.author}</span>
                        <span>•</span>
                        <span>Updated {article.lastModified}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(article.status)} variant="outline">
                      {article.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
