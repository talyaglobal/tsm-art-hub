"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Users,
  Settings,
  FileText,
  Calendar,
  Mail,
  Bell,
  TrendingUp,
  PieChart,
  Activity,
  Server,
  Shield,
  Key,
  UserPlus,
  UserCheck,
  Crown,
  FileBarChart,
  FileSpreadsheet,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  MessageSquare,
  Send,
  BellRing,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Palette,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
  Zap,
} from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  href?: string
  icon: any
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  children?: NavigationItem[]
  description?: string
  isNew?: boolean
  isComingSoon?: boolean
}

interface SidebarNavigationProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  onLogout?: () => void
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Main overview and metrics",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Data insights and reports",
    children: [
      {
        id: "overview",
        label: "Overview",
        href: "/analytics/overview",
        icon: TrendingUp,
        description: "Key performance indicators",
      },
      {
        id: "reports",
        label: "Reports",
        href: "/analytics/reports",
        icon: FileBarChart,
        description: "Detailed analytics reports",
      },
      {
        id: "charts",
        label: "Charts",
        href: "/analytics/charts",
        icon: PieChart,
        description: "Visual data representations",
      },
      {
        id: "realtime",
        label: "Real-time",
        href: "/analytics/realtime",
        icon: Activity,
        badge: "Live",
        badgeVariant: "destructive",
        description: "Live data monitoring",
      },
    ],
  },
  {
    id: "data",
    label: "Data Management",
    icon: Database,
    description: "Database and data operations",
    children: [
      {
        id: "databases",
        label: "Databases",
        href: "/data/databases",
        icon: Server,
        badge: "12",
        description: "Database connections",
      },
      {
        id: "tables",
        label: "Tables",
        href: "/data/tables",
        icon: FileSpreadsheet,
        description: "Data table management",
      },
      {
        id: "backups",
        label: "Backups",
        href: "/data/backups",
        icon: Shield,
        description: "Data backup and recovery",
      },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "User accounts and permissions",
    children: [
      {
        id: "all-users",
        label: "All Users",
        href: "/users",
        icon: Users,
        badge: "1,247",
        description: "Complete user directory",
      },
      {
        id: "add-user",
        label: "Add User",
        href: "/users/add",
        icon: UserPlus,
        description: "Create new user account",
      },
      {
        id: "active-users",
        label: "Active Users",
        href: "/users/active",
        icon: UserCheck,
        badge: "892",
        badgeVariant: "secondary",
        description: "Currently active users",
      },
      {
        id: "admins",
        label: "Administrators",
        href: "/users/admins",
        icon: Crown,
        badge: "23",
        description: "Admin user accounts",
      },
      {
        id: "permissions",
        label: "Permissions",
        href: "/users/permissions",
        icon: Key,
        description: "User roles and permissions",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    description: "Content management system",
    children: [
      {
        id: "documents",
        label: "Documents",
        href: "/content/documents",
        icon: FileText,
        badge: "156",
        description: "Document library",
      },
      {
        id: "knowledge-base",
        label: "Knowledge Base",
        href: "/content/knowledge-base",
        icon: BookOpen,
        isNew: true,
        description: "Help articles and guides",
      },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    description: "Schedule and events",
    children: [
      {
        id: "my-calendar",
        label: "My Calendar",
        href: "/calendar",
        icon: CalendarDays,
        description: "Personal calendar view",
      },
      {
        id: "events",
        label: "Events",
        href: "/calendar/events",
        icon: CalendarCheck,
        badge: "5",
        badgeVariant: "outline",
        description: "Upcoming events",
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: Mail,
    description: "Messaging and notifications",
    children: [
      {
        id: "messages",
        label: "Messages",
        href: "/messages",
        icon: MessageSquare,
        badge: "12",
        badgeVariant: "destructive",
        description: "Direct messages",
      },
      {
        id: "compose",
        label: "Compose",
        href: "/messages/compose",
        icon: Send,
        description: "Send new message",
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: "8",
    badgeVariant: "destructive",
    description: "System notifications",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System configuration",
    children: [
      {
        id: "general",
        label: "General",
        href: "/settings/general",
        icon: Settings,
        description: "General preferences",
      },
      {
        id: "security",
        label: "Security",
        href: "/settings/security",
        icon: Shield,
        description: "Security settings",
      },
      {
        id: "notifications-settings",
        label: "Notifications",
        href: "/settings/notifications",
        icon: BellRing,
        description: "Notification preferences",
      },
      {
        id: "alerts",
        label: "Alerts",
        href: "/settings/alerts",
        icon: AlertTriangle,
        badge: "3",
        badgeVariant: "destructive",
        description: "System alerts configuration",
      },
    ],
  },
]

export function SidebarNavigation({
  user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "Administrator",
  },
  onLogout,
  className,
}: SidebarNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<string[]>(["analytics", "users"])
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  // Auto-expand parent items based on current path
  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const newExpanded = [...expandedItems]

    navigationItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.href && pathname.startsWith(child.href))
        if (hasActiveChild && !newExpanded.includes(item.id)) {
          newExpanded.push(item.id)
        }
      }
    })

    setExpandedItems(newExpanded)
  }, [pathname])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      router.push("/login")
    }
  }

  const filteredItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.children?.some((child) => child.label.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + "/")
    }
    return item.children?.some((child) => isItemActive(child)) || false
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isItemActive(item)
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const IconComponent = item.icon

    const itemContent = (
      <div
        className={cn(
          "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
          level > 0 && "ml-4 pl-6",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm"
            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50",
          collapsed && level === 0 && "justify-center px-2",
        )}
      >
        <IconComponent
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400",
          )}
        />

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="truncate">{item.label}</span>
                {item.isNew && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    New
                  </Badge>
                )}
                {item.isComingSoon && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Soon
                  </Badge>
                )}
              </div>
              {item.description && level === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {item.badge && (
                <Badge variant={item.badgeVariant || "default"} className="text-xs">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform text-gray-400", isExpanded ? "rotate-180" : "")}
                />
              )}
            </div>
          </>
        )}
      </div>
    )

    if (collapsed && level === 0) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {item.href ? (
                <Link href={item.href}>{itemContent}</Link>
              ) : (
                <button onClick={() => !collapsed && hasChildren && toggleExpanded(item.id)} className="w-full">
                  {itemContent}
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <div>
                <p className="font-medium">{item.label}</p>
                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (hasChildren) {
      return (
        <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
          <CollapsibleTrigger asChild>
            <button className="w-full">{itemContent}</button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link key={item.id} href={item.href || "#"}>
        {itemContent}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
          collapsed ? "w-16" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Control Center</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 hidden lg:flex"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => renderNavigationItem(item))}
        </nav>

        {/* Theme Selector */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Appearance
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex-1"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  collapsed && "justify-center px-2",
                )}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Spacer */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:ml-16" : "lg:ml-72")} />
    </>
  )
}
