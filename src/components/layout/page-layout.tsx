"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
}

export function PageLayout({ children, className, title, description, actions }: PageLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {(title || description || actions) && (
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground mt-2">{description}</p>}
              </div>
              {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
