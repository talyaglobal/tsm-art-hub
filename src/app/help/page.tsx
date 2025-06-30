"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Book,
  MessageCircle,
  Video,
  FileText,
  ExternalLink,
  HelpCircle,
  Zap,
  Code,
  Settings,
  Users,
  BarChart3,
} from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const quickLinks = [
    {
      title: "Getting Started",
      description: "Learn the basics of TSmart Hub",
      icon: <Zap className="h-5 w-5" />,
      href: "/help/getting-started",
      category: "Basics",
    },
    {
      title: "API Documentation",
      description: "Complete API reference and guides",
      icon: <Code className="h-5 w-5" />,
      href: "/developer/documentation",
      category: "Development",
    },
    {
      title: "Integration Setup",
      description: "Connect your systems and services",
      icon: <Settings className="h-5 w-5" />,
      href: "/help/integrations",
      category: "Setup",
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: <Users className="h-5 w-5" />,
      href: "/help/user-management",
      category: "Administration",
    },
    {
      title: "Analytics & Monitoring",
      description: "Track performance and usage",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/help/analytics",
      category: "Monitoring",
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/help/troubleshooting",
      category: "Support",
    },
  ]

  const tutorials = [
    {
      title: "Building Your First Integration",
      duration: "10 min",
      type: "Video",
      difficulty: "Beginner",
    },
    {
      title: "Advanced API Gateway Configuration",
      duration: "15 min",
      type: "Article",
      difficulty: "Advanced",
    },
    {
      title: "Setting Up Webhooks",
      duration: "8 min",
      type: "Video",
      difficulty: "Intermediate",
    },
    {
      title: "Monitoring and Alerting Best Practices",
      duration: "12 min",
      type: "Article",
      difficulty: "Intermediate",
    },
  ]

  const faqs = [
    {
      question: "How do I create my first API integration?",
      answer:
        'Navigate to the Integrations page, click "Add Integration", select your source and destination systems, and follow the setup wizard.',
    },
    {
      question: "What authentication methods are supported?",
      answer:
        "We support API keys, OAuth 2.0, JWT tokens, and basic authentication. You can configure these in the API settings.",
    },
    {
      question: "How can I monitor API performance?",
      answer:
        "Use the Analytics dashboard to view real-time metrics, set up alerts for performance thresholds, and access detailed logs.",
    },
    {
      question: "Is there a rate limit for API calls?",
      answer: "Rate limits depend on your plan. Check your account settings for current limits and upgrade options.",
    },
  ]

  const filteredLinks = quickLinks.filter(
    (link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers, learn best practices, and get the most out of TSmart Hub
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">Quick Start</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {link.icon}
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">{link.category}</Badge>
                  </div>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    <span>Learn More</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {tutorials.map((tutorial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {tutorial.type === "Video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        tutorial.difficulty === "Beginner"
                          ? "default"
                          : tutorial.difficulty === "Intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {tutorial.difficulty}
                    </Badge>
                    <Button size="sm">Start Tutorial</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Email:</strong> support@tsmarthub.com
                  </p>
                  <p className="text-sm">
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                  <p className="text-sm">
                    <strong>Available:</strong> Monday - Friday, 9 AM - 6 PM EST
                  </p>
                </div>
                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2 h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>Comprehensive guides and API reference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    API Reference
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Code className="mr-2 h-4 w-4" />
                    SDK Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuration Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
