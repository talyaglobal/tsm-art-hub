"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tenant, TenantContext } from "@/types/tenant"

const TenantContextProvider = createContext<TenantContext | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
  initialTenant?: Tenant | null
}

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Mock tenant for development
  useEffect(() => {
    if (!initialTenant && !tenant) {
      // Set a mock tenant for development
      const mockTenant: Tenant = {
        id: "mock-tenant-id",
        name: "Demo Company",
        slug: "demo-company",
        subdomain: "demo",
        status: "active",
        plan: "professional",
        owner_id: "mock-owner-id",
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
      setTenant(mockTenant)
    }
  }, [initialTenant, tenant])

  const switchTenant = async (tenantId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // For now, just simulate switching
      console.log("Switching to tenant:", tenantId)

      // In a real implementation, this would fetch the new tenant
      // and verify user access
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch tenant")
      console.error("Tenant switch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTenant = async () => {
    if (!tenant) return

    try {
      // In a real implementation, this would refresh tenant data
      console.log("Refreshing tenant:", tenant.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh tenant")
      console.error("Tenant refresh error:", err)
    }
  }

  const updateTenant = async (updates: Partial<Tenant>) => {
    if (!tenant) return

    try {
      // In a real implementation, this would update the tenant
      setTenant({ ...tenant, ...updates, updated_at: new Date().toISOString() })
      console.log("Updating tenant:", updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tenant")
      console.error("Tenant update error:", err)
      throw err
    }
  }

  const value: TenantContext = {
    tenant,
    isLoading,
    error,
    switchTenant,
    refreshTenant,
    updateTenant,
  }

  return <TenantContextProvider.Provider value={value}>{children}</TenantContextProvider.Provider>
}

export function useTenant() {
  const context = useContext(TenantContextProvider)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}

// Tenant-aware hooks
export function useTenantPermissions() {
  const { tenant } = useTenant()
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    if (!tenant) return

    // Mock permissions for development
    const mockPermissions = [
      "apis.read",
      "apis.write",
      "integrations.read",
      "integrations.write",
      "users.read",
      "analytics.read",
      "monitoring.read",
      "settings.read",
    ]

    setPermissions(mockPermissions)
  }, [tenant])

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
