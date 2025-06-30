// API Gateway specific types
export interface ApiConnection {
  id: string
  name: string
  type: "ecommerce" | "accounting" | "payment" | "warehouse" | "banking" | "crm"
  endpoint: string
  status: "active" | "inactive" | "error" | "warning"
  lastSync: string
  recordsProcessed: number
  responseTime: number
  description: string
  authentication: {
    type: "api_key" | "oauth" | "basic_auth"
    credentials: Record<string, any>
  }
  rateLimit: {
    requests: number
    period: string
    remaining: number
  }
  dataMapping: {
    fields: Record<string, string>
    transformations: string[]
  }
}

export interface DataSource {
  id: string
  name: string
  type: string
  connection: ApiConnection
  schema: Record<string, any>
  lastUpdated: string
  recordCount: number
  status: "syncing" | "synced" | "error"
}

export interface DataPipeline {
  id: string
  name: string
  sources: DataSource[]
  transformations: DataTransformation[]
  destination: DataDestination
  schedule: {
    frequency: "realtime" | "hourly" | "daily" | "weekly"
    nextRun: string
  }
  status: "running" | "paused" | "error"
  metrics: {
    recordsProcessed: number
    successRate: number
    avgProcessingTime: number
  }
}

export interface DataTransformation {
  id: string
  type: "merge" | "clean" | "filter" | "aggregate" | "enrich"
  config: Record<string, any>
  order: number
}

export interface DataDestination {
  id: string
  type: "database" | "warehouse" | "api" | "file"
  config: Record<string, any>
}

export interface ApiMetrics {
  totalCalls: number
  activeApis: number
  avgResponseTime: number
  errorRate: number
  uptime: number
  dataProcessed: number
  successfulSyncs: number
}

export interface SecurityEvent {
  id: string
  type: "auth_success" | "auth_failure" | "rate_limit" | "suspicious" | "breach_attempt"
  api: string
  timestamp: string
  details: string
  severity: "low" | "medium" | "high" | "critical"
  ip: string
  userAgent: string
  resolved: boolean
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: ("read" | "write" | "admin")[]
  lastUsed: string
  created: string
  status: "active" | "inactive" | "revoked"
  rateLimit: {
    requests: number
    period: string
  }
  allowedIps: string[]
}

export interface LogEntry {
  id: string
  timestamp: string
  api: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  status: number
  responseTime: number
  requestSize: number
  responseSize: number
  userAgent: string
  ip: string
  requestHeaders: Record<string, string>
  responseHeaders: Record<string, string>
  requestBody?: any
  responseBody?: any
  error?: string
}

export interface Alert {
  id: string
  type: "performance" | "error" | "security" | "quota"
  title: string
  message: string
  severity: "info" | "warning" | "error" | "critical"
  timestamp: string
  api?: string
  acknowledged: boolean
  resolvedAt?: string
}

// API Response types for the gateway
export interface GatewayResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId: string
    processingTime: number
  }
}

// Configuration types
export interface GatewayConfig {
  rateLimit: {
    global: {
      requests: number
      period: string
    }
    perApi: Record<
      string,
      {
        requests: number
        period: string
      }
    >
  }
  security: {
    allowedOrigins: string[]
    requireApiKey: boolean
    enableCors: boolean
  }
  monitoring: {
    enableLogging: boolean
    logLevel: "debug" | "info" | "warn" | "error"
    retentionDays: number
  }
  notifications: {
    email: {
      enabled: boolean
      recipients: string[]
    }
    webhook: {
      enabled: boolean
      url: string
    }
  }
}

export interface IntegrationTemplate {
  id: string
  name: string
  description: string
  type: "ecommerce" | "accounting" | "payment" | "warehouse" | "banking"
  provider: string
  config: {
    endpoints: Record<string, string>
    authentication: Record<string, any>
    dataMapping: Record<string, any>
    rateLimit: {
      requests: number
      period: string
    }
  }
  documentation: string
  tags: string[]
}
