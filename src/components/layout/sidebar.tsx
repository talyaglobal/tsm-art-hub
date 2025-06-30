"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Database,
  GitBranch,
  Globe,
  Home,
  Monitor,
  Settings,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Activity,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "APIs", href: "/apis", icon: Database },
  { name: "Integrations", href: "/integrations", icon: Globe },
  { name: "Pipelines", href: "/pipelines", icon: GitBranch },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Monitor", href: "/monitor", icon: Monitor },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Logs", href: "/logs", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

const quickActions = [
  { name: "Add Integration", href: "/integrations/add", icon: Plus },
  { name: "View Alerts", href: "/monitor?tab=alerts", icon: Bell },
  { name: "Performance", href: "/analytics?view=performance", icon: Zap },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TSmart Hub</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-2">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && item.name === "Monitor" && (
                <Badge variant="destructive" className="ml-auto">
                  3
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20",
            collapsed && "justify-center",
          )}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {!collapsed && (
            <div>
              <p className="text-xs font-medium text-green-700 dark:text-green-300">All Systems Operational</p>
              <p className="text-xs text-green-600 dark:text-green-400">99.9% uptime</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
