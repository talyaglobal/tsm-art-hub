export interface APIDefinition {
  id: string
  tenantId: string
  name: string
  description?: string
  version: string
  basePath: string
  status: "draft" | "published" | "deprecated"

  // Backend Configuration
  backend: {
    type: "http" | "graphql" | "grpc" | "lambda" | "database"
    url: string
    timeout: number
    retries: number
    loadBalancing?: {
      strategy: "round_robin" | "weighted" | "least_connections"
      healthCheck?: {
        path: string
        interval: number
        timeout: number
      }
    }
  }

  // Endpoint Definitions
  endpoints: APIEndpoint[]

  // Global Policies
  policies: PolicyDefinition[]

  // Documentation
  documentation?: {
    title: string
    description: string
    version: string
    contact?: {
      name: string
      email: string
      url?: string
    }
    license?: {
      name: string
      url?: string
    }
  }

  // Metadata
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface APIEndpoint {
  id: string
  path: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"
  summary?: string
  description?: string

  // Parameters
  parameters: {
    path?: ParameterDefinition[]
    query?: ParameterDefinition[]
    header?: ParameterDefinition[]
    cookie?: ParameterDefinition[]
  }

  // Request/Response Schemas
  requestBody?: {
    required: boolean
    contentType: string
    schema: JSONSchema
    examples?: Record<string, any>
  }

  responses: {
    [statusCode: string]: {
      description: string
      contentType: string
      schema: JSONSchema
      examples?: Record<string, any>
    }
  }

  // Endpoint-specific policies
  policies: PolicyDefinition[]

  // Backend override
  backend?: Partial<APIDefinition["backend"]>

  // Security requirements
  security?: SecurityRequirement[]

  // Tags and metadata
  tags: string[]
  deprecated?: boolean
}

export interface ParameterDefinition {
  name: string
  description?: string
  required: boolean
  schema: JSONSchema
  example?: any
  deprecated?: boolean
}

export interface JSONSchema {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object"
  format?: string
  pattern?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  enum?: any[]
  items?: JSONSchema
  properties?: Record<string, JSONSchema>
  required?: string[]
  additionalProperties?: boolean | JSONSchema
  description?: string
  example?: any
}

export interface PolicyDefinition {
  id: string
  name: string
  type: PolicyType
  enabled: boolean
  priority: number
  config: Record<string, any>
  conditions?: PolicyCondition[]
  description?: string
}

export type PolicyType =
  | "authentication"
  | "authorization"
  | "rate_limiting"
  | "transformation"
  | "caching"
  | "security"
  | "logging"
  | "monitoring"
  | "custom"

export interface PolicyCondition {
  field: string
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "regex"
  value: any
  logicalOperator?: "AND" | "OR"
}

export interface SecurityRequirement {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect"
  name: string
  in?: "query" | "header" | "cookie"
  scheme?: "basic" | "bearer" | "digest"
  bearerFormat?: string
  flows?: OAuth2Flows
  openIdConnectUrl?: string
}

export interface OAuth2Flows {
  implicit?: OAuth2Flow
  password?: OAuth2Flow
  clientCredentials?: OAuth2Flow
  authorizationCode?: OAuth2Flow
}

export interface OAuth2Flow {
  authorizationUrl?: string
  tokenUrl?: string
  refreshUrl?: string
  scopes: Record<string, string>
}

// Policy Configuration Types
export interface AuthenticationPolicyConfig {
  type: "apiKey" | "jwt" | "oauth2" | "basic" | "custom"
  apiKey?: {
    name: string
    in: "header" | "query" | "cookie"
    prefix?: string
  }
  jwt?: {
    secret: string
    algorithm: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512"
    issuer?: string
    audience?: string
    expirationRequired?: boolean
  }
  oauth2?: {
    introspectionUrl: string
    clientId: string
    clientSecret: string
    scopes?: string[]
  }
  basic?: {
    realm?: string
    users?: Array<{ username: string; password: string }>
    ldap?: {
      url: string
      baseDN: string
      bindDN: string
      bindPassword: string
    }
  }
  custom?: {
    script: string
    timeout: number
  }
}

export interface AuthorizationPolicyConfig {
  type: "rbac" | "abac" | "acl" | "ip" | "custom"
  rbac?: {
    roles: string[]
    permissions: string[]
    requireAll?: boolean
  }
  abac?: {
    rules: Array<{
      subject: string
      action: string
      resource: string
      condition?: string
    }>
  }
  acl?: {
    users: string[]
    groups: string[]
    deny?: boolean
  }
  ip?: {
    whitelist?: string[]
    blacklist?: string[]
  }
  custom?: {
    script: string
    timeout: number
  }
}

export interface RateLimitingPolicyConfig {
  strategy: "sliding_window" | "fixed_window" | "token_bucket"
  requests: number
  window: number // seconds
  keyBy: "ip" | "user" | "api_key" | "custom"
  customKey?: string
  burst?: number
  distributed?: {
    enabled: boolean
    redis?: {
      url: string
      keyPrefix: string
    }
  }
  quotas?: {
    daily?: number
    monthly?: number
    resetTime?: string // HH:MM format
  }
  overagePolicy?: "block" | "throttle" | "charge"
}

export interface TransformationPolicyConfig {
  request?: {
    headers?: {
      add?: Record<string, string>
      remove?: string[]
      modify?: Record<string, string>
    }
    query?: {
      add?: Record<string, string>
      remove?: string[]
      modify?: Record<string, string>
    }
    body?: {
      template?: string
      jsonPath?: Array<{
        path: string
        value: string
        operation: "add" | "remove" | "replace"
      }>
    }
    path?: {
      rewrite?: string
      regex?: {
        pattern: string
        replacement: string
      }
    }
  }
  response?: {
    headers?: {
      add?: Record<string, string>
      remove?: string[]
      modify?: Record<string, string>
    }
    body?: {
      template?: string
      jsonPath?: Array<{
        path: string
        value: string
        operation: "add" | "remove" | "replace"
      }>
    }
    status?: {
      map?: Record<number, number>
    }
  }
  custom?: {
    script: string
    timeout: number
  }
}

export interface CachingPolicyConfig {
  enabled: boolean
  ttl: number // seconds
  keyBy: "url" | "user" | "custom"
  customKey?: string
  vary?: string[] // headers to vary by
  conditions?: {
    methods?: string[]
    statusCodes?: number[]
    headers?: Record<string, string>
  }
  invalidation?: {
    events?: string[]
    webhooks?: string[]
    manual?: boolean
  }
  storage?: {
    type: "memory" | "redis" | "database"
    redis?: {
      url: string
      keyPrefix: string
    }
  }
}

export interface SecurityPolicyConfig {
  cors?: {
    enabled: boolean
    origins: string[]
    methods: string[]
    headers: string[]
    credentials: boolean
    maxAge?: number
  }
  csrf?: {
    enabled: boolean
    tokenHeader: string
    cookieName: string
    secure: boolean
    sameSite: "strict" | "lax" | "none"
  }
  xss?: {
    enabled: boolean
    mode: "block" | "sanitize"
    allowedTags?: string[]
  }
  sqlInjection?: {
    enabled: boolean
    patterns: string[]
    action: "block" | "sanitize" | "log"
  }
  custom?: {
    rules: Array<{
      name: string
      pattern: string
      action: "block" | "sanitize" | "log"
      message?: string
    }>
  }
}

export interface APISpecification {
  id: string
  name: string
  version: string
  description: string
  definition: string
  type: "openapi" | "graphql" | "grpc" | "custom"
  status: "draft" | "active" | "deprecated"
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
}
