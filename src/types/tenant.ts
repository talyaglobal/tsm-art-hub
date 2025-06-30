export interface Tenant {
  id: string
  name: string
  slug: string
  subdomain: string
  status: "active" | "inactive" | "suspended"
  plan: string
  owner_id: string
  settings: TenantSettings
  limits: TenantLimits
  billing: TenantBilling
  security: TenantSecurity
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TenantSettings {
  timezone: string
  currency: string
  dateFormat: string
  language: string
  features: {
    analytics: boolean
    monitoring: boolean
    webhooks: boolean
    auditLogs: boolean
    apiKeys: boolean
    integrations: boolean
  }
  branding: {
    logo?: string
    primaryColor?: string
    customDomain?: string
  }
  notifications: {
    email: boolean
    slack: boolean
    webhook: boolean
  }
}

export interface TenantLimits {
  maxApiCalls: number
  maxIntegrations: number
  maxUsers: number
  maxProjects: number
  maxWebhooks: number
  maxStorage: number // in MB
  rateLimitPerMinute: number
}

export interface TenantBilling {
  plan: string
  status: "active" | "past_due" | "canceled" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  subscriptionId?: string
  customerId?: string
  currentUsage: {
    apiCalls: number
    integrations: number
    users: number
    projects: number
    webhooks: number
    storage: number
  }
  invoices: TenantInvoice[]
}

export interface TenantInvoice {
  id: string
  amount: number
  currency: string
  status: "paid" | "pending" | "failed"
  dueDate: string
  paidAt?: string
  invoiceUrl?: string
}

export interface TenantSecurity {
  ipWhitelist: string[]
  ssoEnabled: boolean
  mfaRequired: boolean
  sessionTimeout: number // in minutes
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
  }
  auditRetention: number // in days
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: "owner" | "admin" | "member" | "viewer"
  status: "active" | "inactive" | "pending"
  permissions: string[]
  invited_by?: string
  last_active_at?: string
  created_at: string
  updated_at: string
}

export interface TenantInvitation {
  id: string
  tenant_id: string
  email: string
  role: string
  permissions: string[]
  token: string
  status: "pending" | "accepted" | "expired" | "revoked"
  invited_by: string
  expires_at: string
  accepted_at?: string
  created_at: string
}

export interface TenantAnalytics {
  id: string
  tenant_id: string
  date: string
  metrics: {
    apiCalls: number
    successfulCalls: number
    failedCalls: number
    averageResponseTime: number
    uniqueUsers: number
    newIntegrations: number
    activeIntegrations: number
  }
  usage: {
    bandwidth: number
    storage: number
    computeTime: number
  }
  created_at: string
}

export interface TenantContext {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  switchTenant: (tenantId: string) => Promise<void>
  refreshTenant: () => Promise<void>
  updateTenant: (updates: Partial<Tenant>) => Promise<void>
}

export interface TenantAuditLog {
  id: string
  tenant_id: string
  user_id?: string
  action: string
  resource: string
  resource_id?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}
