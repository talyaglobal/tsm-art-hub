import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  backUrl?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, backUrl, children }: PageHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          {backUrl && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={backUrl}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">{children}</div>
      </div>
    </div>
  )
}
