// SaaS API Gateway Types
export interface Tenant {
  id: string
  name: string
  domain: string
  plan: "starter" | "professional" | "enterprise"
  status: "active" | "suspended" | "trial"
  settings: {
    dataRetentionDays: number
    maxIntegrations: number
    maxApiCalls: number
    customDomain?: string
  }
  createdAt: string
  updatedAt: string
}

export interface Integration {
  id: string
  tenantId: string
  name: string
  type: "ecommerce" | "accounting" | "warehouse" | "payment" | "banking" | "crm" | "custom"
  provider: string // 'shopify', 'quickbooks', 'stripe', etc.
  status: "connected" | "disconnected" | "error" | "configuring"
  config: {
    endpoint: string
    authentication: {
      type: "api_key" | "oauth2" | "basic_auth" | "bearer_token"
      credentials: Record<string, any>
    }
    dataMapping: DataMapping[]
    syncFrequency: "realtime" | "hourly" | "daily" | "weekly"
    webhookUrl?: string
  }
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    avgResponseTime: number
    lastSyncAt?: string
    dataPointsProcessed: number
  }
  createdAt: string
  updatedAt: string
}

export interface DataMapping {
  sourceField: string
  targetField: string
  transformation?: DataTransformation
  required: boolean
}

export interface DataTransformation {
  type: "format" | "calculate" | "lookup" | "conditional" | "aggregate"
  config: Record<string, any>
}

export interface DataPipeline {
  id: string
  tenantId: string
  name: string
  description?: string
  sourceIntegrations: string[] // Integration IDs
  transformations: PipelineTransformation[]
  destinations: PipelineDestination[]
  schedule: {
    type: "realtime" | "scheduled"
    cron?: string
    timezone?: string
  }
  status: "active" | "paused" | "error"
  metrics: {
    recordsProcessed: number
    successRate: number
    avgProcessingTime: number
    lastRunAt?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PipelineTransformation {
  id: string
  type: "merge" | "filter" | "aggregate" | "enrich" | "clean" | "validate"
  config: Record<string, any>
  order: number
}

export interface PipelineDestination {
  type: "database" | "webhook" | "api" | "file" | "visualization"
  config: Record<string, any>
}

export interface DataSource {
  id: string
  tenantId: string
  integrationId: string
  name: string
  schema: DataSchema
  recordCount: number
  lastUpdated: string
  status: "syncing" | "synced" | "error"
}

export interface DataSchema {
  fields: SchemaField[]
  relationships?: SchemaRelationship[]
}

export interface SchemaField {
  name: string
  type: "string" | "number" | "boolean" | "date" | "object" | "array"
  required: boolean
  description?: string
  format?: string
}

export interface SchemaRelationship {
  field: string
  relatedSource: string
  relatedField: string
  type: "one-to-one" | "one-to-many" | "many-to-many"
}

export interface AIIntegrationSuggestion {
  id: string
  tenantId: string
  type: "integration" | "transformation" | "optimization"
  title: string
  description: string
  confidence: number
  estimatedImpact: "low" | "medium" | "high"
  config: Record<string, any>
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface WebhookEvent {
  id: string
  tenantId: string
  integrationId: string
  type: string
  payload: Record<string, any>
  status: "pending" | "processing" | "completed" | "failed"
  retryCount: number
  processedAt?: string
  createdAt: string
}

export interface ApiUsage {
  tenantId: string
  date: string
  requests: number
  dataProcessed: number // in bytes
  integrations: Record<string, number>
}

export interface GatewayAlert {
  id: string
  tenantId: string
  type: "quota_exceeded" | "integration_error" | "performance_degradation" | "security_threat"
  severity: "info" | "warning" | "error" | "critical"
  title: string
  message: string
  metadata: Record<string, any>
  acknowledged: boolean
  resolvedAt?: string
  createdAt: string
}
