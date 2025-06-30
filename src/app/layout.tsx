import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TSmart Hub - API Management Platform",
  description: "Comprehensive API management, integration, and analytics platform",
  keywords: ["API", "management", "integration", "analytics", "microservices"],
  authors: [{ name: "TSmart Hub Team" }],
  creator: "TSmart Hub",
  publisher: "TSmart Hub",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tsmarthub.com",
    title: "TSmart Hub - API Management Platform",
    description: "Comprehensive API management, integration, and analytics platform",
    siteName: "TSmart Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "TSmart Hub - API Management Platform",
    description: "Comprehensive API management, integration, and analytics platform",
    creator: "@tsmarthub",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-background font-sans antialiased">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
