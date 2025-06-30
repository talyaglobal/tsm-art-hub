import type { PolicyDefinition } from "@/types/api-definition"

export interface PolicyTemplate {
  id: string
  name: string
  description: string
  type: "rate_limit" | "access_control" | "data_validation" | "transformation" | "security"
  parameters: Array<{
    name: string
    type: string
    description: string
    required: boolean
    default?: any
  }>
  conditions: Array<{
    type: "header" | "query" | "body" | "path" | "method" | "ip" | "user" | "time"
    field?: string
    operator: "equals" | "contains" | "regex" | "in" | "not_in" | "greater_than" | "less_than"
    value: any
    negate?: boolean
  }>
  actions: Array<{
    type: "allow" | "deny" | "rate_limit" | "transform" | "log" | "redirect" | "modify_headers"
    parameters: Record<string, any>
  }>
}

export const policyTemplates: PolicyTemplate[] = [
  // Authentication Templates
  {
    id: "api_key_auth",
    name: "API Key Authentication",
    description: "Secure your API with API key authentication in header, query, or cookie",
    type: "security",
    parameters: [
      {
        name: "keyName",
        type: "string",
        description: "Name of the API key parameter",
        required: true,
        default: "X-API-Key",
      },
      {
        name: "keyLocation",
        type: "string",
        description: "Where to look for the API key",
        required: true,
        default: "header",
      },
      {
        name: "keyPrefix",
        type: "string",
        description: "Optional prefix for the API key (e.g., 'Bearer ')",
        required: false,
        default: "",
      },
    ],
    conditions: [
      {
        type: "header",
        field: "{{keyName}}",
        operator: "contains",
        value: "{{keyPrefix}}",
      },
    ],
    actions: [
      {
        type: "allow",
        parameters: {},
      },
    ],
    metadata: {},
  },
  {
    id: "jwt_auth",
    name: "JWT Token Authentication",
    description: "Validate JWT tokens with configurable algorithms and claims",
    type: "security",
    parameters: [
      {
        name: "secret",
        type: "string",
        description: "JWT signing secret",
        required: true,
        default: "",
      },
      {
        name: "algorithm",
        type: "string",
        description: "JWT signing algorithm",
        required: true,
        default: "HS256",
      },
      {
        name: "issuer",
        type: "string",
        description: "Expected JWT issuer (optional)",
        required: false,
        default: "",
      },
      {
        name: "audience",
        type: "string",
        description: "Expected JWT audience (optional)",
        required: false,
        default: "",
      },
      {
        name: "requireExpiration",
        type: "boolean",
        description: "Require expiration claim",
        required: false,
        default: true,
      },
    ],
    conditions: [
      {
        type: "header",
        field: "Authorization",
        operator: "regex",
        value: `Bearer {{secret}}`,
      },
    ],
    actions: [
      {
        type: "allow",
        parameters: {},
      },
    ],
    metadata: {},
  },

  // Authorization Templates
  {
    id: "role_based_access",
    name: "Role-Based Access Control",
    description: "Control access based on user roles and permissions",
    type: "access_control",
    parameters: [
      {
        name: "requiredRoles",
        type: "array",
        description: "List of required roles",
        required: true,
        default: ["user"],
      },
      {
        name: "requireAllRoles",
        type: "boolean",
        description: "Require all roles (AND) or any role (OR)",
        required: false,
        default: false,
      },
      {
        name: "permissions",
        type: "array",
        description: "Required permissions (optional)",
        required: false,
        default: [],
      },
    ],
    conditions: [
      {
        type: "user",
        field: "role",
        operator: "in",
        value: "{{requiredRoles}}",
      },
    ],
    actions: [
      {
        type: "allow",
        parameters: {},
      },
    ],
    metadata: {},
  },
  {
    id: "ip_whitelist",
    name: "IP Address Whitelist",
    description: "Allow access only from specific IP addresses or ranges",
    type: "access_control",
    parameters: [
      {
        name: "allowedIPs",
        type: "array",
        description: "List of allowed IP addresses or CIDR ranges",
        required: true,
        default: ["127.0.0.1", "::1"],
      },
    ],
    conditions: [
      {
        type: "ip",
        operator: "in",
        value: "{{allowedIPs}}",
      },
    ],
    actions: [
      {
        type: "allow",
        parameters: {},
      },
    ],
    metadata: {},
  },

  // Rate Limiting Templates
  {
    id: "basic_rate_limit",
    name: "Basic Rate Limiting",
    description: "Limit requests per time window to prevent abuse",
    type: "rate_limit",
    parameters: [
      {
        name: "requestsPerWindow",
        type: "number",
        description: "Number of requests allowed per window",
        required: true,
        default: 100,
      },
      {
        name: "windowSeconds",
        type: "number",
        description: "Time window in seconds",
        required: true,
        default: 3600,
      },
      {
        name: "keyBy",
        type: "string",
        description: "How to identify unique clients",
        required: true,
        default: "ip",
      },
    ],
    conditions: [],
    actions: [
      {
        type: "rate_limit",
        parameters: {
          limit: "{{requestsPerWindow}}",
          window: "{{windowSeconds}}",
          keyBy: "{{keyBy}}",
        },
      },
    ],
    metadata: {},
  },
  {
    id: "burst_rate_limit",
    name: "Burst Rate Limiting",
    description: "Allow bursts of traffic with token bucket algorithm",
    type: "rate_limit",
    parameters: [
      {
        name: "requestsPerSecond",
        type: "number",
        description: "Sustained requests per second",
        required: true,
        default: 10,
      },
      {
        name: "burstCapacity",
        type: "number",
        description: "Maximum burst capacity",
        required: true,
        default: 50,
      },
      {
        name: "keyBy",
        type: "string",
        description: "How to identify unique clients",
        required: true,
        default: "ip",
      },
    ],
    conditions: [],
    actions: [
      {
        type: "rate_limit",
        parameters: {
          limit: "{{requestsPerSecond}}",
          window: 1,
          burst: "{{burstCapacity}}",
          keyBy: "{{keyBy}}",
        },
      },
    ],
    metadata: {},
  },

  // Security Templates
  {
    id: "cors_policy",
    name: "CORS Policy",
    description: "Configure Cross-Origin Resource Sharing for web applications",
    type: "security",
    parameters: [
      {
        name: "allowedOrigins",
        type: "array",
        description: "Allowed origins (* for all)",
        required: true,
        default: ["*"],
      },
      {
        name: "allowedMethods",
        type: "array",
        description: "Allowed HTTP methods",
        required: true,
        default: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        name: "allowedHeaders",
        type: "array",
        description: "Allowed request headers",
        required: true,
        default: ["Content-Type", "Authorization"],
      },
      {
        name: "allowCredentials",
        type: "boolean",
        description: "Allow credentials (cookies, auth headers)",
        required: false,
        default: false,
      },
      {
        name: "maxAge",
        type: "number",
        description: "Preflight cache duration in seconds",
        required: false,
        default: 3600,
      },
    ],
    conditions: [],
    actions: [
      {
        type: "modify_headers",
        parameters: {
          headers: {
            "Access-Control-Allow-Origin": "{{allowedOrigins}}",
            "Access-Control-Allow-Methods": "{{allowedMethods}}",
            "Access-Control-Allow-Headers": "{{allowedHeaders}}",
            "Access-Control-Allow-Credentials": "{{allowCredentials}}",
            "Access-Control-Max-Age": "{{maxAge}}",
          },
        },
      },
    ],
    metadata: {},
  },
  {
    id: "xss_protection",
    name: "XSS Protection",
    description: "Protect against Cross-Site Scripting attacks",
    type: "security",
    parameters: [
      {
        name: "mode",
        type: "string",
        description: "Action to take when XSS is detected",
        required: true,
        default: "block",
      },
      {
        name: "allowedTags",
        type: "array",
        description: "HTML tags to allow (for sanitize mode)",
        required: false,
        default: ["p", "br", "strong", "em"],
      },
    ],
    conditions: [],
    actions: [
      {
        type: "log",
        parameters: {
          level: "warning",
          message: "XSS detected",
        },
      },
    ],
    metadata: {},
  },

  // Transformation Templates
  {
    id: "add_headers",
    name: "Add Request Headers",
    description: "Add custom headers to incoming requests",
    type: "transformation",
    parameters: [
      {
        name: "headers",
        type: "object",
        description: "Headers to add (key-value pairs)",
        required: true,
        default: { "X-Forwarded-By": "TSmart-Hub" },
      },
    ],
    conditions: [],
    actions: [
      {
        type: "modify_headers",
        parameters: {
          headers: "{{headers}}",
        },
      },
    ],
    metadata: {},
  },
  {
    id: "path_rewrite",
    name: "Path Rewriting",
    description: "Rewrite request paths before forwarding to backend",
    type: "transformation",
    parameters: [
      {
        name: "pattern",
        type: "string",
        description: "Regex pattern to match",
        required: true,
        default: "^/api/v1/(.*)",
      },
      {
        name: "replacement",
        type: "string",
        description: "Replacement pattern",
        required: true,
        default: "/v2/$1",
      },
    ],
    conditions: [],
    actions: [
      {
        type: "transform",
        parameters: {
          path: {
            regex: {
              pattern: "{{pattern}}",
              replacement: "{{replacement}}",
            },
          },
        },
      },
    ],
    metadata: {},
  },

  // Caching Templates
  {
    id: "response_caching",
    name: "Response Caching",
    description: "Cache API responses to improve performance",
    type: "transformation",
    parameters: [
      {
        name: "ttlSeconds",
        type: "number",
        description: "Cache TTL in seconds",
        required: true,
        default: 300,
      },
      {
        name: "keyBy",
        type: "string",
        description: "Cache key strategy",
        required: true,
        default: "url",
      },
      {
        name: "varyHeaders",
        type: "array",
        description: "Headers to vary cache by",
        required: false,
        default: ["Accept", "Accept-Language"],
      },
      {
        name: "cacheMethods",
        type: "array",
        description: "HTTP methods to cache",
        required: false,
        default: ["GET", "HEAD"],
      },
    ],
    conditions: [],
    actions: [
      {
        type: "transform",
        parameters: {
          cache: {
            ttl: "{{ttlSeconds}}",
            keyBy: "{{keyBy}}",
            vary: "{{varyHeaders}}",
            methods: "{{cacheMethods}}",
          },
        },
      },
    ],
    metadata: {},
  },

  // New Templates
  {
    id: "rate_limit_ip",
    name: "Rate Limit by IP",
    description: "Limit the number of requests from a specific IP address",
    type: "rate_limit",
    parameters: [
      {
        name: "limit",
        type: "number",
        description: "Maximum number of requests",
        required: true,
        default: 100,
      },
      {
        name: "window",
        type: "number",
        description: "Time window in seconds",
        required: true,
        default: 60,
      },
    ],
    conditions: [
      {
        type: "ip",
        operator: "equals",
        value: "127.0.0.1",
      },
    ],
    actions: [
      {
        type: "rate_limit",
        parameters: {
          limit: "{{limit}}",
          window: "{{window}}",
        },
      },
    ],
    metadata: {},
  },
  {
    id: "access_control_role",
    name: "Access Control by Role",
    description: "Allow access only to users with a specific role",
    type: "access_control",
    parameters: [
      {
        name: "role",
        type: "string",
        description: "Required user role",
        required: true,
      },
    ],
    conditions: [
      {
        type: "user",
        field: "role",
        operator: "equals",
        value: "admin",
      },
    ],
    actions: [
      {
        type: "allow",
        parameters: {},
      },
    ],
    metadata: {},
  },
  {
    id: "data_validation_schema",
    name: "Data Validation by Schema",
    description: "Validate request body against a JSON schema",
    type: "data_validation",
    parameters: [
      {
        name: "schema",
        type: "string",
        description: "JSON schema for validation",
        required: true,
      },
    ],
    conditions: [],
    actions: [
      {
        type: "allow",
        parameters: {},
      },
    ],
    metadata: {},
  },
  {
    id: "transformation_header",
    name: "Transformation - Add Header",
    description: "Add a custom header to the request",
    type: "transformation",
    parameters: [
      {
        name: "headerName",
        type: "string",
        description: "Name of the header to add",
        required: true,
      },
      {
        name: "headerValue",
        type: "string",
        description: "Value of the header",
        required: true,
      },
    ],
    conditions: [],
    actions: [
      {
        type: "modify_headers",
        parameters: {
          headers: {
            "{{headerName}}": "{{headerValue}}",
          },
        },
      },
    ],
    metadata: {},
  },
  {
    id: "security_log_request",
    name: "Security - Log Request",
    description: "Log all requests to a specific endpoint",
    type: "security",
    parameters: [
      {
        name: "level",
        type: "string",
        description: "Log level (info, warning, error)",
        required: true,
        default: "info",
      },
      {
        name: "message",
        type: "string",
        description: "Custom log message",
        required: false,
      },
    ],
    conditions: [
      {
        type: "path",
        operator: "contains",
        value: "/api/sensitive",
      },
    ],
    actions: [
      {
        type: "log",
        parameters: {
          level: "{{level}}",
          message: "{{message}}",
        },
      },
    ],
    metadata: {},
  },
]

export class PolicyTemplateEngine {
  private templates = new Map<string, PolicyTemplate>()

  constructor() {
    policyTemplates.forEach((template) => {
      this.templates.set(template.id, template)
    })
  }

  getTemplate(id: string): PolicyTemplate | undefined {
    return this.templates.get(id)
  }

  getAllTemplates(): PolicyTemplate[] {
    return Array.from(this.templates.values())
  }

  getTemplatesByType(type: PolicyTemplate["type"]): PolicyTemplate[] {
    return this.getAllTemplates().filter((template) => template.type === type)
  }

  searchTemplates(query: string): PolicyTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllTemplates().filter(
      (template) =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.parameters.some((param) => param.name.toLowerCase().includes(lowerQuery)),
    )
  }

  instantiateTemplate(templateId: string, variables: Record<string, any>): PolicyDefinition | null {
    const template = this.getTemplate(templateId)
    if (!template) return null

    // Validate variables
    const validationErrors = this.validateVariables(template, variables)
    if (validationErrors.length > 0) {
      throw new Error(`Template validation failed: ${validationErrors.join(", ")}`)
    }

    // Replace template variables
    const policy = this.replaceVariables(template, variables)

    return {
      id: `${templateId}_${Date.now()}`,
      ...policy,
    }
  }

  private validateVariables(template: PolicyTemplate, variables: Record<string, any>): string[] {
    const errors: string[] = []

    for (const param of template.parameters) {
      const value = variables[param.name]

      // Check required variables
      if (param.required && (value === undefined || value === null || value === "")) {
        errors.push(`Parameter '${param.name}' is required`)
        continue
      }

      // Skip validation if parameter is not provided and not required
      if (value === undefined || value === null) continue

      // Type validation
      if (!this.validateVariableType(value, param.type)) {
        errors.push(`Parameter '${param.name}' must be of type ${param.type}`)
        continue
      }
    }

    return errors
  }

  private validateVariableType(value: any, type: string): boolean {
    switch (type) {
      case "string":
        return typeof value === "string"
      case "number":
        return typeof value === "number" && !isNaN(value)
      case "boolean":
        return typeof value === "boolean"
      case "array":
        return Array.isArray(value)
      case "object":
        return typeof value === "object" && value !== null && !Array.isArray(value)
      default:
        return true
    }
  }

  private replaceVariables(template: PolicyTemplate, variables: Record<string, any>): any {
    const result: any = {}

    for (const key in template) {
      if (key === "parameters" || key === "conditions" || key === "actions" || key === "metadata") {
        result[key] = template[key]
      } else {
        result[key] = this.replaceStringVariables(template[key], variables)
      }
    }

    return result
  }

  private replaceStringVariables(obj: any, variables: Record<string, any>): any {
    if (typeof obj === "string") {
      return obj.replace(/{{([^}]+)}}/g, (match, expression) => {
        const value = variables[expression]
        return value !== undefined ? String(value) : match
      })
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceStringVariables(item, variables))
    }

    if (typeof obj === "object" && obj !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.replaceStringVariables(value, variables)
      }
      return result
    }

    return obj
  }
}

export const policyTemplateEngine = new PolicyTemplateEngine()
