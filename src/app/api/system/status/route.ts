import { type NextRequest, NextResponse } from "next/server"
import { healthMonitoringService } from "@/lib/services/health-monitoring-service"
import { infrastructureService } from "@/lib/services/infrastructure-service"
import { jobQueue } from "@/lib/queue/job-queue"
import { cache } from "@/lib/cache/redis-client"
import { config } from "@/lib/config/environment"

interface SystemStatus {
  timestamp: string
  environment: string
  version: string
  uptime: number
  system: {
    platform: string
    arch: string
    nodeVersion: string
    memory: SystemMemory
    cpu: SystemCPU
    disk: SystemDisk
  }
  services: {
    database: ServiceStatus
    cache: ServiceStatus
    queue: ServiceStatus
    monitoring: ServiceStatus
  }
  infrastructure: {
    regions: RegionStatus[]
    totalInstances: number
    healthyInstances: number
    alerts: AlertSummary
  }
  performance: {
    responseTime: PerformanceMetrics
    throughput: PerformanceMetrics
    errorRate: PerformanceMetrics
  }
  features: FeatureFlags
}

interface SystemMemory {
  total: number
  used: number
  free: number
  percentage: number
  heap: {
    used: number
    total: number
    limit: number
  }
}

interface SystemCPU {
  model: string
  cores: number
  usage: number
  loadAverage: number[]
}

interface SystemDisk {
  total: number
  used: number
  free: number
  percentage: number
}

interface ServiceStatus {
  status: "healthy" | "degraded" | "unhealthy" | "unknown"
  uptime: number
  responseTime: number
  lastCheck: string
  version?: string
  details?: Record<string, any>
}

interface RegionStatus {
  region: string
  zone: string
  instances: number
  healthyInstances: number
  status: "healthy" | "degraded" | "unhealthy"
  lastUpdate: string
}

interface AlertSummary {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  active: number
  resolved: number
}

interface PerformanceMetrics {
  current: number
  average: number
  min: number
  max: number
  trend: "up" | "down" | "stable"
}

interface FeatureFlags {
  webhooks: boolean
  realtime: boolean
  analytics: boolean
  tracing: boolean
  metrics: boolean
}

const startTime = Date.now()

async function getSystemInfo() {
  const os = require("os")
  const memUsage = process.memoryUsage()

  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    memory: {
      total: os.totalmem(),
      used: os.totalmem() - os.freemem(),
      free: os.freemem(),
      percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        limit: memUsage.rss,
      },
    },
    cpu: {
      model: os.cpus()[0]?.model || "unknown",
      cores: os.cpus().length,
      usage: getCPUUsage(),
      loadAverage: os.loadavg(),
    },
    disk: await getDiskUsage(),
  }
}

function getCPUUsage(): number {
  const os = require("os")
  const cpus = os.cpus()

  let totalIdle = 0
  let totalTick = 0

  cpus.forEach((cpu: any) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  })

  return 100 - ~~((100 * totalIdle) / totalTick)
}

async function getDiskUsage(): Promise<SystemDisk> {
  // In a real implementation, you would use a library like 'node-disk-info'
  // For now, return mock data
  return {
    total: 100 * 1024 * 1024 * 1024, // 100GB
    used: 30 * 1024 * 1024 * 1024, // 30GB
    free: 70 * 1024 * 1024 * 1024, // 70GB
    percentage: 30,
  }
}

async function checkDatabaseStatus(): Promise<ServiceStatus> {
  const start = Date.now()

  try {
    const overview = await healthMonitoringService.getSystemOverview()
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      uptime: Date.now() - startTime,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        services: overview.services.total,
        alerts: overview.alerts.total,
      },
    }
  } catch (error) {
    return {
      status: "unhealthy",
      uptime: Date.now() - startTime,
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

async function checkCacheStatus(): Promise<ServiceStatus> {
  const start = Date.now()

  try {
    const stats = cache.getStats()
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      uptime: Date.now() - startTime,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: stats,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      uptime: Date.now() - startTime,
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

async function checkQueueStatus(): Promise<ServiceStatus> {
  const start = Date.now()

  try {
    const stats = jobQueue.getStats()
    const responseTime = Date.now() - start

    return {
      status: stats.isRunning ? "healthy" : "degraded",
      uptime: Date.now() - startTime,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: stats,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      uptime: Date.now() - startTime,
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

async function checkMonitoringStatus(): Promise<ServiceStatus> {
  const start = Date.now()

  try {
    const report = await healthMonitoringService.generateHealthReport(1)
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      uptime: Date.now() - startTime,
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        services: report.summary.totalServices,
        healthyServices: report.summary.healthyServices,
      },
    }
  } catch (error) {
    return {
      status: "unhealthy",
      uptime: Date.now() - startTime,
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

async function getInfrastructureStatus() {
  try {
    const [instances, overview] = await Promise.all([
      infrastructureService.getHealthyInstances("api"),
      healthMonitoringService.getSystemOverview(),
    ])

    // Group instances by region
    const regionMap = new Map<string, { total: number; healthy: number }>()

    instances.forEach((instance) => {
      const key = `${instance.region}-${instance.zone}`
      const current = regionMap.get(key) || { total: 0, healthy: 0 }
      current.total++
      if (instance.status === "healthy") {
        current.healthy++
      }
      regionMap.set(key, current)
    })

    const regions: RegionStatus[] = Array.from(regionMap.entries()).map(([key, stats]) => {
      const [region, zone] = key.split("-")
      const status = stats.healthy === 0 ? "unhealthy" : stats.healthy < stats.total ? "degraded" : "healthy"

      return {
        region,
        zone,
        instances: stats.total,
        healthyInstances: stats.healthy,
        status,
        lastUpdate: new Date().toISOString(),
      }
    })

    const alerts: AlertSummary = {
      total: overview.alerts.total,
      critical: overview.alerts.critical,
      high: overview.alerts.high,
      medium: overview.alerts.medium,
      low: overview.alerts.low,
      active: overview.alerts.total,
      resolved: 0,
    }

    return {
      regions,
      totalInstances: instances.length,
      healthyInstances: instances.filter((i) => i.status === "healthy").length,
      alerts,
    }
  } catch (error) {
    return {
      regions: [],
      totalInstances: 0,
      healthyInstances: 0,
      alerts: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        active: 0,
        resolved: 0,
      },
    }
  }
}

function getPerformanceMetrics() {
  // In a real implementation, these would come from actual monitoring data
  return {
    responseTime: {
      current: 150,
      average: 200,
      min: 50,
      max: 500,
      trend: "stable" as const,
    },
    throughput: {
      current: 1000,
      average: 800,
      min: 100,
      max: 2000,
      trend: "up" as const,
    },
    errorRate: {
      current: 0.5,
      average: 1.2,
      min: 0,
      max: 5,
      trend: "down" as const,
    },
  }
}

function getFeatureFlags(): FeatureFlags {
  return {
    webhooks: config.features.enableWebhooks,
    realtime: config.features.enableRealtime,
    analytics: config.features.enableAnalytics,
    tracing: config.monitoring.enableTracing,
    metrics: config.monitoring.enableMetrics,
  }
}

export async function GET(request: NextRequest) {
  try {
    const start = Date.now()

    // Gather all system information
    const [systemInfo, databaseStatus, cacheStatus, queueStatus, monitoringStatus, infrastructureStatus] =
      await Promise.all([
        getSystemInfo(),
        checkDatabaseStatus(),
        checkCacheStatus(),
        checkQueueStatus(),
        checkMonitoringStatus(),
        getInfrastructureStatus(),
      ])

    const status: SystemStatus = {
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || "unknown",
      uptime: Date.now() - startTime,
      system: systemInfo,
      services: {
        database: databaseStatus,
        cache: cacheStatus,
        queue: queueStatus,
        monitoring: monitoringStatus,
      },
      infrastructure: infrastructureStatus,
      performance: getPerformanceMetrics(),
      features: getFeatureFlags(),
    }

    const responseTime = Date.now() - start

    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Response-Time": `${responseTime}ms`,
      },
    })
  } catch (error) {
    console.error("System status check failed:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "System status check failed",
        uptime: Date.now() - startTime,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}
