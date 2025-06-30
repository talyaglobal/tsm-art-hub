"use client"

import { useState, useEffect } from "react"
import type { Tenant } from "@/types/tenant"

// Mock tenant data for development
const mockTenant: Tenant = {
  id: "demo-tenant-id",
  name: "Demo Company",
  slug: "demo-company",
  subdomain: "demo",
  status: "active",
  plan: "professional",
  owner_id: "demo-owner-id",
  settings: {
    timezone: "UTC",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    language: "en",
    features: {
      analytics: true,
      monitoring: true,
      webhooks: true,
      auditLogs: true,
      apiKeys: true,
      integrations: true,
    },
    branding: {
      primaryColor: "#3B82F6",
    },
    notifications: {
      email: true,
      slack: false,
      webhook: false,
    },
  },
  limits: {
    maxApiCalls: 100000,
    maxIntegrations: 25,
    maxUsers: 25,
    maxProjects: 10,
    maxWebhooks: 50,
    maxStorage: 1000,
    rateLimitPerMinute: 1000,
  },
  billing: {
    plan: "professional",
    status: "active",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    currentUsage: {
      apiCalls: 15000,
      integrations: 8,
      users: 12,
      projects: 3,
      webhooks: 15,
      storage: 250,
    },
    invoices: [],
  },
  security: {
    ipWhitelist: [],
    ssoEnabled: false,
    mfaRequired: false,
    sessionTimeout: 480,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
    auditRetention: 90,
  },
  metadata: {
    industry: "technology",
    companySize: "11-50",
    onboardingCompleted: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setTenant(mockTenant)
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const switchTenant = async (tenantId: string) => {
    console.log("Switching to tenant:", tenantId)
    return true
  }

  const refreshTenant = async () => {
    console.log("Refreshing tenant")
  }

  const updateTenant = async (updates: Partial<Tenant>) => {
    if (tenant) {
      setTenant({ ...tenant, ...updates, updated_at: new Date().toISOString() })
    }
  }

  return {
    tenant,
    isLoading,
    error,
    switchTenant,
    refreshTenant,
    updateTenant,
  }
}

export function useTenantPermissions() {
  const { tenant } = useTenant()
  const [permissions] = useState<string[]>([
    "apis.read",
    "apis.write",
    "integrations.read",
    "integrations.write",
    "users.read",
    "users.write",
    "analytics.read",
    "monitoring.read",
    "settings.read",
    "settings.write",
  ])

  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || permissions.includes("*")
  }

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some((permission) => hasPermission(permission))
  }

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every((permission) => hasPermission(permission))
  }

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
