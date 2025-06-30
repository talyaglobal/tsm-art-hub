"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Users,
  Settings,
  Database,
  Activity,
  Shield,
  FileText,
  BarChart3,
  Webhook,
  Key,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navigation = [
  {
    name: "Overview",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "APIs",
    href: "/admin/apis",
    icon: Database,
  },
  {
    name: "Integrations",
    href: "/admin/integrations",
    icon: Webhook,
  },
  {
    name: "Security",
    href: "/admin/security",
    icon: Shield,
  },
  {
    name: "Logs",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    name: "Monitoring",
    href: "/admin/monitoring",
    icon: Activity,
  },
  {
    name: "API Keys",
    href: "/admin/api-keys",
    icon: Key,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            {!collapsed && <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>}
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", collapsed && "px-2")}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && item.name}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
