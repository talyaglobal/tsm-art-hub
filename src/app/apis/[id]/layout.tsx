"use client"

import type React from "react"

import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/overview" },
  { name: "Metrics", href: "/metrics" },
  { name: "Logs", href: "/logs" },
  { name: "Settings", href: "/settings" },
]

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const apiId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/apis">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to APIs
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex space-x-1">
                {navigation.map((item) => {
                  const href = `/apis/${apiId}${item.href}`
                  const isActive = pathname === href
                  return (
                    <Link key={item.name} href={href}>
                      <Button variant={isActive ? "default" : "ghost"} size="sm">
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {children}
    </div>
  )
}
