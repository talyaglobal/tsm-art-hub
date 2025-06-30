interface DatabaseConfig {
  url: string
  maxConnections: number
  connectionTimeout: number
  idleTimeout: number
  ssl: boolean
}

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

interface RedisConfig {
  url: string
  maxRetries: number
  retryDelay: number
  keyPrefix: string
}

interface MonitoringConfig {
  enableMetrics: boolean
  enableTracing: boolean
  enableLogging: boolean
  metricsInterval: number
  logLevel: string
  tracingSampleRate: number
}

interface FeaturesConfig {
  enableWebhooks: boolean
  enableRealtime: boolean
  enableAnalytics: boolean
  enableCaching: boolean
  enableRateLimiting: boolean
}

interface SecurityConfig {
  jwtSecret: string
  jwtExpiresIn: string
  bcryptRounds: number
  corsOrigins: string[]
  rateLimitWindow: number
  rateLimitMax: number
}

interface AppConfig {
  nodeEnv: string
  port: number
  host: string
  baseUrl: string
  apiVersion: string
  database: DatabaseConfig
  supabase: SupabaseConfig
  redis: RedisConfig
  monitoring: MonitoringConfig
  features: FeaturesConfig
  security: SecurityConfig
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name]
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value || defaultValue || ""
}

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name]
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`)
  }
  return parsed
}

function getEnvBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]
  if (!value) return defaultValue
  return value.toLowerCase() === "true"
}

function getEnvArray(name: string, defaultValue: string[] = []): string[] {
  const value = process.env[name]
  if (!value) return defaultValue
  return value.split(",").map((item) => item.trim())
}

export const config: AppConfig = {
  nodeEnv: getEnvVar("NODE_ENV", "development"),
  port: getEnvNumber("PORT", 3000),
  host: getEnvVar("HOST", "localhost"),
  baseUrl: getEnvVar("BASE_URL", "http://localhost:3000"),
  apiVersion: getEnvVar("API_VERSION", "v1"),

  database: {
    url: getEnvVar("DATABASE_URL", "postgresql://localhost:5432/tsmarthub"),
    maxConnections: getEnvNumber("DB_MAX_CONNECTIONS", 20),
    connectionTimeout: getEnvNumber("DB_CONNECTION_TIMEOUT", 30000),
    idleTimeout: getEnvNumber("DB_IDLE_TIMEOUT", 600000),
    ssl: getEnvBoolean("DB_SSL", false),
  },

  supabase: {
    url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL", ""),
    anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
    serviceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", ""),
  },

  redis: {
    url: getEnvVar("REDIS_URL", "redis://localhost:6379"),
    maxRetries: getEnvNumber("REDIS_MAX_RETRIES", 3),
    retryDelay: getEnvNumber("REDIS_RETRY_DELAY", 1000),
    keyPrefix: getEnvVar("REDIS_KEY_PREFIX", "tsmarthub:"),
  },

  monitoring: {
    enableMetrics: getEnvBoolean("ENABLE_METRICS", true),
    enableTracing: getEnvBoolean("ENABLE_TRACING", true),
    enableLogging: getEnvBoolean("ENABLE_LOGGING", true),
    metricsInterval: getEnvNumber("METRICS_INTERVAL", 60000),
    logLevel: getEnvVar("LOG_LEVEL", "info"),
    tracingSampleRate: getEnvNumber("TRACING_SAMPLE_RATE", 100) / 100,
  },

  features: {
    enableWebhooks: getEnvBoolean("ENABLE_WEBHOOKS", true),
    enableRealtime: getEnvBoolean("ENABLE_REALTIME", true),
    enableAnalytics: getEnvBoolean("ENABLE_ANALYTICS", true),
    enableCaching: getEnvBoolean("ENABLE_CACHING", true),
    enableRateLimiting: getEnvBoolean("ENABLE_RATE_LIMITING", true),
  },

  security: {
    jwtSecret: getEnvVar("JWT_SECRET", "your-secret-key"),
    jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "24h"),
    bcryptRounds: getEnvNumber("BCRYPT_ROUNDS", 12),
    corsOrigins: getEnvArray("CORS_ORIGINS", ["http://localhost:3000"]),
    rateLimitWindow: getEnvNumber("RATE_LIMIT_WINDOW", 900000), // 15 minutes
    rateLimitMax: getEnvNumber("RATE_LIMIT_MAX", 100),
  },
}

export function validateConfig(): void {
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  if (config.nodeEnv === "production") {
    if (config.security.jwtSecret === "your-secret-key") {
      throw new Error("JWT_SECRET must be set in production")
    }
  }
}

export function isDevelopment(): boolean {
  return config.nodeEnv === "development"
}

export function isProduction(): boolean {
  return config.nodeEnv === "production"
}

export function isTest(): boolean {
  return config.nodeEnv === "test"
}

// Validate configuration on import
if (typeof window === "undefined") {
  // Only validate on server side
  try {
    validateConfig()
  } catch (error) {
    console.error("Configuration validation failed:", error)
    if (isProduction()) {
      process.exit(1)
    }
  }
}
