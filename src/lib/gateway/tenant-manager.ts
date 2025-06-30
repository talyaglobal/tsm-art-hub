interface Tenant {
  id: string
  name: string
  slug: string
  status: "active" | "suspended" | "pending" | "deleted"
  plan: "free" | "basic" | "pro" | "enterprise"
  settings: {
    maxUsers: number
    maxIntegrations: number
    maxAPIRequests: number
    features: string[]
    customDomain?: string
    branding?: {
      logo?: string
      primaryColor?: string
      secondaryColor?: string
    }
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    lastActiveAt?: Date
    ownerId: string
    billingEmail: string
  }
  usage: {
    users: number
    integrations: number
    apiRequests: number
    storage: number
  }
}

interface TenantContext {
  tenant: Tenant
  user?: {
    id: string
    role: string
    permissions: string[]
  }
}

export class TenantManager {
  private static instance: TenantManager
  private tenants: Map<string, Tenant> = new Map()
  private tenantsBySlug: Map<string, string> = new Map()

  static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager()
    }
    return TenantManager.instance
  }

  async createTenant(tenantData: {
    name: string
    slug: string
    ownerId: string
    billingEmail: string
    plan?: "free" | "basic" | "pro" | "enterprise"
  }): Promise<Tenant> {
    const { name, slug, ownerId, billingEmail, plan = "free" } = tenantData

    // Validate slug uniqueness
    if (this.tenantsBySlug.has(slug)) {
      throw new Error(`Tenant slug '${slug}' is already taken`)
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Tenant slug must contain only lowercase letters, numbers, and hyphens")
    }

    const id = this.generateTenantId()
    const tenant: Tenant = {
      id,
      name,
      slug,
      status: "active",
      plan,
      settings: this.getDefaultSettings(plan),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId,
        billingEmail,
      },
      usage: {
        users: 1, // Owner is the first user
        integrations: 0,
        apiRequests: 0,
        storage: 0,
      },
    }

    this.tenants.set(id, tenant)
    this.tenantsBySlug.set(slug, id)

    // Initialize tenant resources
    await this.initializeTenantResources(tenant)

    return tenant
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenants.get(id)
    if (!tenant) {
      throw new Error(`Tenant ${id} not found`)
    }

    // Handle slug updates
    if (updates.slug && updates.slug !== tenant.slug) {
      if (this.tenantsBySlug.has(updates.slug)) {
        throw new Error(`Tenant slug '${updates.slug}' is already taken`)
      }
      this.tenantsBySlug.delete(tenant.slug)
      this.tenantsBySlug.set(updates.slug, id)
    }

    const updatedTenant: Tenant = {
      ...tenant,
      ...updates,
      id, // Ensure ID cannot be changed
      metadata: {
        ...tenant.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    }

    this.tenants.set(id, updatedTenant)
    return updatedTenant
  }

  async deleteTenant(id: string): Promise<void> {
    const tenant = this.tenants.get(id)
    if (!tenant) {
      throw new Error(`Tenant ${id} not found`)
    }

    // Mark as deleted instead of hard delete
    await this.updateTenant(id, { status: "deleted" })

    // Clean up resources
    await this.cleanupTenantResources(tenant)

    // Remove from slug mapping
    this.tenantsBySlug.delete(tenant.slug)
  }

  async suspendTenant(id: string, reason?: string): Promise<Tenant> {
    const tenant = await this.updateTenant(id, { status: "suspended" })

    // Log suspension
    await this.logTenantEvent(id, "suspended", { reason })

    return tenant
  }

  async reactivateTenant(id: string): Promise<Tenant> {
    const tenant = await this.updateTenant(id, { status: "active" })

    // Log reactivation
    await this.logTenantEvent(id, "reactivated")

    return tenant
  }

  getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id)
  }

  getTenantBySlug(slug: string): Tenant | undefined {
    const id = this.tenantsBySlug.get(slug)
    return id ? this.tenants.get(id) : undefined
  }

  async validateTenantAccess(tenantId: string, userId: string): Promise<boolean> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant || tenant.status !== "active") {
      return false
    }

    // Check if user belongs to tenant
    // This would typically query a database
    return true // Mock implementation
  }

  async checkTenantLimits(
    tenantId: string,
    resource: keyof Tenant["usage"],
  ): Promise<{
    allowed: boolean
    current: number
    limit: number
    remaining: number
  }> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const current = tenant.usage[resource]
    const limit = this.getResourceLimit(tenant.plan, resource)
    const remaining = Math.max(0, limit - current)

    return {
      allowed: current < limit,
      current,
      limit,
      remaining,
    }
  }

  async incrementUsage(tenantId: string, resource: keyof Tenant["usage"], amount = 1): Promise<void> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const updatedUsage = {
      ...tenant.usage,
      [resource]: tenant.usage[resource] + amount,
    }

    await this.updateTenant(tenantId, { usage: updatedUsage })
  }

  async decrementUsage(tenantId: string, resource: keyof Tenant["usage"], amount = 1): Promise<void> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const updatedUsage = {
      ...tenant.usage,
      [resource]: Math.max(0, tenant.usage[resource] - amount),
    }

    await this.updateTenant(tenantId, { usage: updatedUsage })
  }

  async upgradeTenantPlan(tenantId: string, newPlan: Tenant["plan"]): Promise<Tenant> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const newSettings = this.getDefaultSettings(newPlan)
    const updatedTenant = await this.updateTenant(tenantId, {
      plan: newPlan,
      settings: {
        ...tenant.settings,
        ...newSettings,
      },
    })

    await this.logTenantEvent(tenantId, "plan_upgraded", {
      oldPlan: tenant.plan,
      newPlan,
    })

    return updatedTenant
  }

  async getTenantStats(tenantId: string): Promise<{
    usage: Tenant["usage"]
    limits: Record<keyof Tenant["usage"], number>
    utilization: Record<keyof Tenant["usage"], number>
    trends: {
      apiRequests: Array<{ date: string; count: number }>
      storage: Array<{ date: string; bytes: number }>
    }
  }> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const limits = {
      users: this.getResourceLimit(tenant.plan, "users"),
      integrations: this.getResourceLimit(tenant.plan, "integrations"),
      apiRequests: this.getResourceLimit(tenant.plan, "apiRequests"),
      storage: this.getResourceLimit(tenant.plan, "storage"),
    }

    const utilization = {
      users: tenant.usage.users / limits.users,
      integrations: tenant.usage.integrations / limits.integrations,
      apiRequests: tenant.usage.apiRequests / limits.apiRequests,
      storage: tenant.usage.storage / limits.storage,
    }

    // Mock trend data
    const trends = {
      apiRequests: this.generateMockTrend(tenant.usage.apiRequests),
      storage: this.generateMockTrend(tenant.usage.storage),
    }

    return {
      usage: tenant.usage,
      limits,
      utilization,
      trends,
    }
  }

  listTenants(filters?: {
    status?: Tenant["status"]
    plan?: Tenant["plan"]
    ownerId?: string
  }): Tenant[] {
    let tenants = Array.from(this.tenants.values())

    if (filters) {
      if (filters.status) {
        tenants = tenants.filter((t) => t.status === filters.status)
      }
      if (filters.plan) {
        tenants = tenants.filter((t) => t.plan === filters.plan)
      }
      if (filters.ownerId) {
        tenants = tenants.filter((t) => t.metadata.ownerId === filters.ownerId)
      }
    }

    return tenants
  }

  private getDefaultSettings(plan: Tenant["plan"]): Tenant["settings"] {
    const planSettings = {
      free: {
        maxUsers: 3,
        maxIntegrations: 2,
        maxAPIRequests: 1000,
        features: ["basic_integrations", "basic_analytics"],
      },
      basic: {
        maxUsers: 10,
        maxIntegrations: 5,
        maxAPIRequests: 10000,
        features: ["basic_integrations", "basic_analytics", "webhooks"],
      },
      pro: {
        maxUsers: 50,
        maxIntegrations: 20,
        maxAPIRequests: 100000,
        features: ["all_integrations", "advanced_analytics", "webhooks", "custom_connectors"],
      },
      enterprise: {
        maxUsers: -1, // Unlimited
        maxIntegrations: -1,
        maxAPIRequests: -1,
        features: ["all_integrations", "advanced_analytics", "webhooks", "custom_connectors", "sso", "audit_logs"],
      },
    }

    return planSettings[plan]
  }

  private getResourceLimit(plan: Tenant["plan"], resource: keyof Tenant["usage"]): number {
    const settings = this.getDefaultSettings(plan)

    switch (resource) {
      case "users":
        return settings.maxUsers
      case "integrations":
        return settings.maxIntegrations
      case "apiRequests":
        return settings.maxAPIRequests
      case "storage":
        return plan === "free" ? 1000000 : plan === "basic" ? 10000000 : -1 // bytes
      default:
        return -1
    }
  }

  private async initializeTenantResources(tenant: Tenant): Promise<void> {
    // Initialize tenant-specific resources
    // This would typically involve creating database schemas, S3 buckets, etc.
  }

  private async cleanupTenantResources(tenant: Tenant): Promise<void> {
    // Clean up tenant-specific resources
    // This would typically involve removing database schemas, S3 buckets, etc.
  }

  private async logTenantEvent(tenantId: string, event: string, metadata?: Record<string, any>): Promise<void> {
    // Log tenant events for audit purposes
    console.log(`Tenant ${tenantId}: ${event}`, metadata)
  }

  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private generateMockTrend(currentValue: number): Array<{ date: string; count: number }> {
    const trend = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      trend.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(currentValue * (0.7 + Math.random() * 0.6)),
      })
    }

    return trend
  }

  // Context management for request-scoped tenant data
  private currentContext: TenantContext | null = null

  setContext(context: TenantContext): void {
    this.currentContext = context
  }

  getContext(): TenantContext | null {
    return this.currentContext
  }

  clearContext(): void {
    this.currentContext = null
  }

  async withTenantContext<T>(tenantId: string, userId: string, callback: () => Promise<T>): Promise<T> {
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const previousContext = this.currentContext

    try {
      this.setContext({
        tenant,
        user: {
          id: userId,
          role: "user", // This would be fetched from database
          permissions: [], // This would be fetched from database
        },
      })

      return await callback()
    } finally {
      this.currentContext = previousContext
    }
  }
}
