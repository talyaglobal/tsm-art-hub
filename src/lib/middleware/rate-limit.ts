import { type NextRequest, NextResponse } from "next/server"
import { cache } from "@/lib/cache/redis-client"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

interface RateLimitInfo {
  totalHits: number
  totalTime: number
  resetTime: Date
}

export const rateLimitConfigs = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Too many API requests",
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many authentication attempts",
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "Too many upload requests",
  },
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: "Too many webhook requests",
  },
}

export function withRateLimit(config: RateLimitConfig) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) =>
    async (request: NextRequest): Promise<NextResponse> => {
      try {
        const key = config.keyGenerator ? config.keyGenerator(request) : getDefaultKey(request)
        const rateLimitKey = `rate_limit:${key}`

        const now = Date.now()
        const windowStart = now - config.windowMs

        // Get current rate limit info
        const info = await getRateLimitInfo(rateLimitKey, windowStart, now)

        // Check if rate limit exceeded
        if (info.totalHits >= config.maxRequests) {
          return NextResponse.json(
            {
              success: false,
              error: "Rate Limit Exceeded",
              message: config.message || "Too many requests",
              retryAfter: Math.ceil((info.resetTime.getTime() - now) / 1000),
              limit: config.maxRequests,
              remaining: 0,
              reset: info.resetTime.toISOString(),
              timestamp: new Date().toISOString(),
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": config.maxRequests.toString(),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": info.resetTime.toISOString(),
                "Retry-After": Math.ceil((info.resetTime.getTime() - now) / 1000).toString(),
              },
            },
          )
        }

        // Record this request
        await recordRequest(rateLimitKey, now, config.windowMs)

        // Execute the handler
        const response = await handler(request)

        // Add rate limit headers to response
        const remaining = Math.max(0, config.maxRequests - info.totalHits - 1)
        response.headers.set("X-RateLimit-Limit", config.maxRequests.toString())
        response.headers.set("X-RateLimit-Remaining", remaining.toString())
        response.headers.set("X-RateLimit-Reset", info.resetTime.toISOString())

        return response
      } catch (error) {
        console.error("Rate limit middleware error:", error)
        // Continue without rate limiting on error
        return handler(request)
      }
    }
}

function getDefaultKey(request: NextRequest): string {
  // Try to get user ID from headers first
  const userId = request.headers.get("x-user-id")
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

  return `ip:${ip}`
}

async function getRateLimitInfo(key: string, windowStart: number, now: number): Promise<RateLimitInfo> {
  try {
    // Get all timestamps for this key
    const timestamps = (await cache.get<number[]>(key)) || []

    // Filter timestamps within the current window
    const validTimestamps = timestamps.filter((timestamp) => timestamp > windowStart)

    const totalHits = validTimestamps.length
    const oldestTimestamp = validTimestamps.length > 0 ? Math.min(...validTimestamps) : now
    const resetTime = new Date(oldestTimestamp + (now - windowStart))

    return {
      totalHits,
      totalTime: now - oldestTimestamp,
      resetTime,
    }
  } catch (error) {
    console.error("Error getting rate limit info:", error)
    return {
      totalHits: 0,
      totalTime: 0,
      resetTime: new Date(now),
    }
  }
}

async function recordRequest(key: string, timestamp: number, windowMs: number): Promise<void> {
  try {
    // Get current timestamps
    const timestamps = (await cache.get<number[]>(key)) || []

    // Add new timestamp
    timestamps.push(timestamp)

    // Remove old timestamps outside the window
    const windowStart = timestamp - windowMs
    const validTimestamps = timestamps.filter((ts) => ts > windowStart)

    // Store updated timestamps with TTL
    await cache.set(key, validTimestamps, windowMs)
  } catch (error) {
    console.error("Error recording request:", error)
  }
}

export function createCustomRateLimit(config: RateLimitConfig) {
  return withRateLimit(config)
}

export function createIPRateLimit(maxRequests: number, windowMs: number) {
  return withRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      const forwarded = request.headers.get("x-forwarded-for")
      const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
      return `ip:${ip}`
    },
    message: "Too many requests from this IP",
  })
}

export function createUserRateLimit(maxRequests: number, windowMs: number) {
  return withRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      const userId = request.headers.get("x-user-id") || "anonymous"
      return `user:${userId}`
    },
    message: "Too many requests from this user",
  })
}

export function createEndpointRateLimit(endpoint: string, maxRequests: number, windowMs: number) {
  return withRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      const forwarded = request.headers.get("x-forwarded-for")
      const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
      return `endpoint:${endpoint}:ip:${ip}`
    },
    message: `Too many requests to ${endpoint}`,
  })
}
