"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "./button"

interface BackButtonProps {
  href?: string
  text?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  className?: string
}

export function BackButton({ href, text = "Back", variant = "ghost", className = "" }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button variant={variant} onClick={handleClick} className={`mb-6 ${className}`}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </Button>
  )
}
