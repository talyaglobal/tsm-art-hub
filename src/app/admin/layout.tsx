"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster />
    </div>
  )
}
