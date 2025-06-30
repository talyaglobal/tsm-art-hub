import { type NextRequest, NextResponse } from "next/server"
import { healthMonitoringService } from "@/lib/services/health-monitoring-service"
import { infrastructureService } from "@/lib/services/infrastructure-service"
import { cache } from "@/lib/cache/redis-client"
import { jobQueue } from "@/lib/queue/job-queue"

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: HealthCheck
    cache: HealthCheck
    queue: HealthCheck
    services: HealthCheck
  }
  metrics: {
    memory: MemoryMetrics
    cpu: CPUMetrics
    requests: RequestMetrics
  }
}

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  responseTime: number
  message?: string
  details?: Record<string, any>
}

interface MemoryMetrics {
  used: number
  total: number
  percentage: number
  heap: {
    used: number
    total: number
  }
}

interface CPUMetrics {
  usage: number
  loadAverage: number[]
}

interface RequestMetrics {
  total: number
  successful: number
  failed: number
  averageResponseTime: number
}

const startTime = Date.now()

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    // Simple database connectivity check
    const overview = await healthMonitoringService.getSystemOverview()
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      responseTime,
      message: "Database connection successful",
      details: {
        services: overview.services.total,
        alerts: overview.alerts.total,
      },
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      status: "unhealthy",
      responseTime,
      message: error instanceof Error ? error.message : "Database connection failed",
    }
  }
}

async function checkCache(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    const testKey = "health_check_test"
    const testValue = Date.now().toString()

    await cache.set(testKey, testValue, 5000) // 5 seconds TTL
    const retrieved = await cache.get(testKey)
    await cache.del(testKey)

    const responseTime = Date.now() - start

    if (retrieved === testValue) {
      const stats = cache.getStats()
      return {
        status: "healthy",
        responseTime,
        message: "Cache operations successful",
        details: stats,
      }
    } else {
      return {
        status: "degraded",
        responseTime,
        message: "Cache read/write mismatch",
      }
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      status: "unhealthy",
      responseTime,
      message: error instanceof Error ? error.message : "Cache operations failed",
    }
  }
}

async function checkQueue(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    const stats = jobQueue.getStats()
    const responseTime = Date.now() - start

    const status = stats.isRunning ? "healthy" : "degraded"

    return {
      status,
      responseTime,
      message: stats.isRunning ? "Job queue is running" : "Job queue is stopped",
      details: stats,
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      status: "unhealthy",
      responseTime,
      message: error instanceof Error ? error.message : "Job queue check failed",
    }
  }
}

async function checkServices(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    const instances = await infrastructureService.getHealthyInstances("api")
    const responseTime = Date.now() - start

    const status = instances.length > 0 ? "healthy" : "degraded"

    return {
      status,
      responseTime,
      message: `${instances.length} healthy service instances`,
      details: {
        healthyInstances: instances.length,
        instances: instances.map((i) => ({
          id: i.id,
          region: i.region,
          status: i.status,
        })),
      },
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      status: "unhealthy",
      responseTime,
      message: error instanceof Error ? error.message : "Service check failed",
    }
  }
}

function getMemoryMetrics(): MemoryMetrics {
  const memUsage = process.memoryUsage()

  return {
    used: memUsage.rss,
    total: memUsage.rss + memUsage.external,
    percentage: (memUsage.rss / (memUsage.rss + memUsage.external)) * 100,
    heap: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
    },
  }
}

function getCPUMetrics(): CPUMetrics {
  const cpus = require("os").cpus()
  const loadAvg = require("os").loadavg()

  // Calculate CPU usage (simplified)
  let totalIdle = 0
  let totalTick = 0

  cpus.forEach((cpu: any) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  })

  const usage = 100 - ~~((100 * totalIdle) / totalTick)

  return {
    usage,
    loadAverage: loadAvg,
  }
}

// Simple request metrics (in production, this would come from monitoring)
function getRequestMetrics(): RequestMetrics {
  return {
    total: 0,
    successful: 0,
    failed: 0,
    averageResponseTime: 0,
  }
}

function determineOverallStatus(checks: HealthCheckResult["checks"]): "healthy" | "degraded" | "unhealthy" {
  const statuses = Object.values(checks).map((check) => check.status)

  if (statuses.includes("unhealthy")) {
    return "unhealthy"
  }

  if (statuses.includes("degraded")) {
    return "degraded"
  }

  return "healthy"
}

export async function GET(request: NextRequest) {
  try {
    const start = Date.now()

    // Run all health checks in parallel
    const [databaseCheck, cacheCheck, queueCheck, servicesCheck] = await Promise.all([
      checkDatabase(),
      checkCache(),
      checkQueue(),
      checkServices(),
    ])

    const checks = {
      database: databaseCheck,
      cache: cacheCheck,
      queue: queueCheck,
      services: servicesCheck,
    }

    const overallStatus = determineOverallStatus(checks)
    const uptime = Date.now() - startTime

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
      uptime,
      checks,
      metrics: {
        memory: getMemoryMetrics(),
        cpu: getCPUMetrics(),
        requests: getRequestMetrics(),
      },
    }

    const responseTime = Date.now() - start

    // Set appropriate HTTP status code
    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Response-Time": `${responseTime}ms`,
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
        uptime: Date.now() - startTime,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}

// Simple health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    // Quick check - just verify basic functionality
    const overview = await healthMonitoringService.getSystemOverview()

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  }
}
