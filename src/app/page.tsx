import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Database, Zap, Shield, BarChart3, Webhook, Code, ArrowRight, CheckCircle, Globe, Cpu } from "lucide-react"

const features = [
  {
    icon: Database,
    title: "Smart Data Integration",
    description: "Connect and sync data from multiple sources with AI-powered mapping and transformation.",
    badge: "AI-Powered",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Process millions of events per second with our high-performance streaming engine.",
    badge: "High Performance",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption, audit logs, and compliance controls.",
    badge: "SOC 2 Compliant",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get deep insights with real-time dashboards, custom reports, and predictive analytics.",
    badge: "Business Intelligence",
  },
  {
    icon: Webhook,
    title: "API Gateway",
    description: "Manage, secure, and monitor all your APIs from a single, unified platform.",
    badge: "API Management",
  },
  {
    icon: Code,
    title: "Developer Tools",
    description: "Auto-generate SDKs, documentation, and connectors to accelerate development.",
    badge: "DevOps Ready",
  },
]

const stats = [
  { label: "APIs Managed", value: "10M+" },
  { label: "Data Points/Day", value: "1B+" },
  { label: "Uptime SLA", value: "99.99%" },
  { label: "Global Regions", value: "15+" },
]

const benefits = [
  "Reduce integration time by 80%",
  "Scale to millions of requests per second",
  "Enterprise-grade security and compliance",
  "Real-time monitoring and alerting",
  "Auto-generated documentation and SDKs",
  "Multi-tenant architecture with isolation",
]

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Cpu className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TSmartHub</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-primary">
              Documentation
            </Link>
            <Link href="/support" className="text-sm font-medium hover:text-primary">
              Support
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container px-4 py-24 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Globe className="mr-2 h-3 w-3" />
              Trusted by 1000+ companies worldwide
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              The Complete{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Integration Platform
              </span>{" "}
              for Modern Businesses
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Connect, transform, and manage your data with our AI-powered integration platform. Build scalable
              microservices, manage APIs, and gain real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                <Link href="/demo">Watch Demo</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to scale</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From data integration to API management, we provide all the tools you need to build and scale modern
              applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Why choose TSmartHub?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built for enterprise scale with developer-first approach. Our platform handles the complexity so you can
                focus on building great products.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-3xl transform rotate-3"></div>
              <Card className="relative bg-white shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">TSmartHub Dashboard</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">API Gateway</span>
                    </div>
                    <Badge variant="secondary">99.99% uptime</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Data Pipeline</span>
                    </div>
                    <Badge variant="secondary">1.2M events/min</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">AI Processing</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <div className="mx-auto max-w-2xl space-y-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to transform your business?</h2>
            <p className="text-xl opacity-90">
              Join thousands of companies already using TSmartHub to scale their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Cpu className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">TSmartHub</span>
              </div>
              <p className="text-sm text-muted-foreground">The complete integration platform for modern businesses.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="block text-muted-foreground hover:text-foreground">
                  Features
                </Link>
                <Link href="/pricing" className="block text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/integrations" className="block text-muted-foreground hover:text-foreground">
                  Integrations
                </Link>
                <Link href="/api" className="block text-muted-foreground hover:text-foreground">
                  API
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <Link href="/docs" className="block text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
                <Link href="/guides" className="block text-muted-foreground hover:text-foreground">
                  Guides
                </Link>
                <Link href="/blog" className="block text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
                <Link href="/support" className="block text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link href="/careers" className="block text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 TSmartHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
