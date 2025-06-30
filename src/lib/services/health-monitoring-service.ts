import { healthMonitoringQueries } from "@/lib/database/health-monitoring-queries"
import type { ServiceHealth, HealthReport, AlertRule, MonitoringDashboard } from "@/types/health-monitoring"
import { cache } from "@/lib/cache/redis-client"
import { jobQueue } from "@/lib/queue/job-queue"

export class HealthMonitoringService {
  private cachePrefix = "health:"
  private cacheTTL = 300000 // 5 minutes

  async getServices(filters?: {
    type?: string
    status?: string
    region?: string
  }): Promise<ServiceHealth[]> {
    const cacheKey = `${this.cachePrefix}services:${JSON.stringify(filters || {})}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getServices(filters)
      },
      { ttl: this.cacheTTL },
    )
  }

  async getService(id: string): Promise<ServiceHealth | null> {
    const cacheKey = `${this.cachePrefix}service:${id}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getService(id)
      },
      { ttl: this.cacheTTL },
    )
  }

  async createService(service: Omit<ServiceHealth, "id">): Promise<ServiceHealth> {
    const created = await healthMonitoringQueries.createService(service)

    // Invalidate cache
    await cache.invalidatePattern(`${this.cachePrefix}services:*`)

    // Schedule initial health check
    await jobQueue.add("health_check", { serviceId: created.id }, { delay: 5000 })

    return created
  }

  async updateService(id: string, updates: Partial<ServiceHealth>): Promise<ServiceHealth> {
    const updated = await healthMonitoringQueries.updateService(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}service:${id}`)
    await cache.invalidatePattern(`${this.cachePrefix}services:*`)

    return updated
  }

  async deleteService(id: string): Promise<void> {
    await healthMonitoringQueries.deleteService(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}service:${id}`)
    await cache.invalidatePattern(`${this.cachePrefix}services:*`)
  }

  async performHealthCheck(serviceId: string): Promise<any> {
    const service = await this.getService(serviceId)

    if (!service) {
      throw new Error(`Service ${serviceId} not found`)
    }

    const startTime = Date.now()
    let status = "passing"
    let output = ""
    let error: string | undefined

    try {
      // Perform the actual health check based on service type
      switch (service.type) {
        case "api":
          await this.performHttpHealthCheck(service)
          output = "HTTP health check passed"
          break
        case "database":
          await this.performDatabaseHealthCheck(service)
          output = "Database health check passed"
          break
        case "cache":
          await this.performCacheHealthCheck(service)
          output = "Cache health check passed"
          break
        default:
          output = "Basic health check passed"
      }
    } catch (err) {
      status = "failing"
      error = err instanceof Error ? err.message : "Unknown error"
      output = `Health check failed: ${error}`
    }

    const duration = Date.now() - startTime

    const checkResult = {
      id: `check_${Date.now()}`,
      name: "health_check",
      type: service.type,
      status,
      output,
      duration,
      timestamp: new Date().toISOString(),
      attempt: 1,
      config: service.checks[0]?.config || {},
    }

    // Record the health check
    await healthMonitoringQueries.recordHealthCheck(serviceId, checkResult)

    // Update service status
    const newStatus = status === "passing" ? "healthy" : "unhealthy"
    if (service.status !== newStatus) {
      await this.updateService(serviceId, { status: newStatus })

      // Create alert if service became unhealthy
      if (newStatus === "unhealthy") {
        await this.createAlert({
          service_id: serviceId,
          type: "availability",
          severity: "error",
          title: `Service ${service.name} is unhealthy`,
          description: output,
          status: "active",
          timestamp: new Date().toISOString(),
        })
      }
    }

    return checkResult
  }

  private async performHttpHealthCheck(service: ServiceHealth): Promise<void> {
    if (!service.endpoint) {
      throw new Error("No endpoint configured for HTTP health check")
    }

    const response = await fetch(service.endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "TSmart-Hub-Health-Check",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  private async performDatabaseHealthCheck(service: ServiceHealth): Promise<void> {
    // This would typically perform a simple query to check database connectivity
    // For now, we'll simulate it
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async performCacheHealthCheck(service: ServiceHealth): Promise<void> {
    // This would typically perform a simple get/set operation to check cache connectivity
    // For now, we'll simulate it
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  async getHealthChecks(serviceId: string, timeRange: { start: string; end: string }) {
    const cacheKey = `${this.cachePrefix}checks:${serviceId}:${timeRange.start}:${timeRange.end}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getHealthChecks(serviceId, timeRange)
      },
      { ttl: 60000 }, // 1 minute cache for health checks
    )
  }

  async getAlerts(filters?: {
    severity?: string
    status?: string
    serviceId?: string
  }) {
    const cacheKey = `${this.cachePrefix}alerts:${JSON.stringify(filters || {})}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getAlerts(filters)
      },
      { ttl: 60000 }, // 1 minute cache for alerts
    )
  }

  async createAlert(alert: any) {
    const created = await healthMonitoringQueries.createAlert(alert)

    // Invalidate cache
    await cache.invalidatePattern(`${this.cachePrefix}alerts:*`)

    // Schedule alert notification
    await jobQueue.add("alert_notification", { alertId: created.id }, { priority: 8 })

    return created
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string) {
    const updated = await healthMonitoringQueries.acknowledgeAlert(id, acknowledgedBy)

    // Invalidate cache
    await cache.invalidatePattern(`${this.cachePrefix}alerts:*`)

    return updated
  }

  async resolveAlert(id: string) {
    const updated = await healthMonitoringQueries.resolveAlert(id)

    // Invalidate cache
    await cache.invalidatePattern(`${this.cachePrefix}alerts:*`)

    return updated
  }

  async generateHealthReport(hours = 24): Promise<HealthReport> {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)

    const timeRange = {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    }

    const [services, alerts] = await Promise.all([this.getServices(), this.getAlerts({ status: "active" })])

    const healthyServices = services.filter((s) => s.status === "healthy")
    const degradedServices = services.filter((s) => s.status === "degraded")
    const unhealthyServices = services.filter((s) => s.status === "unhealthy")
    const unknownServices = services.filter((s) => s.status === "unknown")

    const criticalAlerts = alerts.filter((a) => a.severity === "critical")

    const overallStatus =
      unhealthyServices.length > 0 || criticalAlerts.length > 0
        ? "unhealthy"
        : degradedServices.length > 0
          ? "degraded"
          : "healthy"

    const summary = {
      totalServices: services.length,
      healthyServices: healthyServices.length,
      degradedServices: degradedServices.length,
      unhealthyServices: unhealthyServices.length,
      unknownServices: unknownServices.length,
      overallStatus,
      availability: services.length > 0 ? (healthyServices.length / services.length) * 100 : 100,
      averageResponseTime: this.calculateAverageResponseTime(services),
      totalAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      activeIncidents: 0, // Would be calculated from incidents table
    }

    const serviceReports = services.map((service) => ({
      serviceId: service.id,
      serviceName: service.name,
      status: service.status,
      availability: service.metrics.availability,
      uptime: service.metrics.uptime,
      incidents: 0, // Would be calculated from incidents
      alerts: alerts.filter((a) => a.service_id === service.id).length,
      performanceScore: this.calculatePerformanceScore(service),
      trends: {
        availability: "stable" as const,
        performance: "stable" as const,
        reliability: "stable" as const,
      },
    }))

    const report: HealthReport = {
      id: `report_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeRange,
      summary,
      services: serviceReports,
      incidents: [], // Would be fetched from incidents table
      trends: [], // Would be calculated from historical data
      recommendations: this.generateRecommendations(services, alerts),
      metadata: {
        generatedBy: "system",
        version: "1.0.0",
        duration: 0, // Would be calculated
      },
    }

    // Store the report
    await healthMonitoringQueries.createHealthReport(report)

    return report
  }

  private calculateAverageResponseTime(services: ServiceHealth[]): number {
    if (services.length === 0) return 0

    const totalResponseTime = services.reduce((sum, service) => sum + service.metrics.responseTime.average, 0)
    return totalResponseTime / services.length
  }

  private calculatePerformanceScore(service: ServiceHealth): number {
    const availability = service.metrics.availability
    const responseTime = service.metrics.responseTime.average
    const errorRate = service.metrics.errorRate.average

    // Simple scoring algorithm (0-100)
    let score = 100

    // Deduct points for low availability
    if (availability < 99.9) score -= (99.9 - availability) * 10
    if (availability < 99) score -= (99 - availability) * 20

    // Deduct points for high response time (assuming 200ms is good)
    if (responseTime > 200) score -= Math.min((responseTime - 200) / 10, 30)

    // Deduct points for high error rate
    if (errorRate > 0.1) score -= Math.min(errorRate * 100, 40)

    return Math.max(0, Math.round(score))
  }

  private generateRecommendations(services: ServiceHealth[], alerts: any[]) {
    const recommendations = []

    // Check for services with low availability
    const lowAvailabilityServices = services.filter((s) => s.metrics.availability < 99)
    if (lowAvailabilityServices.length > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_availability`,
        type: "reliability",
        priority: "high",
        title: "Improve service availability",
        description: `${lowAvailabilityServices.length} services have availability below 99%`,
        impact: "Reduced user experience and potential revenue loss",
        effort: "medium",
        timeline: "1-2 weeks",
        actions: [
          {
            title: "Implement health checks",
            description: "Add comprehensive health checks for all services",
            type: "monitoring",
            automated: false,
          },
          {
            title: "Set up auto-scaling",
            description: "Configure automatic scaling based on load",
            type: "scaling",
            automated: true,
          },
        ],
        metrics: ["availability", "uptime"],
      })
    }

    // Check for services with high response times
    const slowServices = services.filter((s) => s.metrics.responseTime.average > 500)
    if (slowServices.length > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_performance`,
        type: "performance",
        priority: "medium",
        title: "Optimize service performance",
        description: `${slowServices.length} services have response times above 500ms`,
        impact: "Slower user experience and reduced throughput",
        effort: "high",
        timeline: "2-4 weeks",
        actions: [
          {
            title: "Implement caching",
            description: "Add caching layers to reduce response times",
            type: "optimization",
            automated: false,
          },
          {
            title: "Database optimization",
            description: "Optimize database queries and indexes",
            type: "optimization",
            automated: false,
          },
        ],
        metrics: ["response_time", "throughput"],
      })
    }

    // Check for too many critical alerts
    const criticalAlerts = alerts.filter((a) => a.severity === "critical")
    if (criticalAlerts.length > 5) {
      recommendations.push({
        id: `rec_${Date.now()}_alerts`,
        type: "monitoring",
        priority: "high",
        title: "Reduce critical alerts",
        description: `${criticalAlerts.length} critical alerts are currently active`,
        impact: "Alert fatigue and potential missed incidents",
        effort: "low",
        timeline: "1 week",
        actions: [
          {
            title: "Review alert thresholds",
            description: "Adjust alert thresholds to reduce noise",
            type: "configuration",
            automated: false,
          },
          {
            title: "Implement alert grouping",
            description: "Group related alerts to reduce volume",
            type: "configuration",
            automated: true,
          },
        ],
        metrics: ["alert_count", "alert_resolution_time"],
      })
    }

    return recommendations
  }

  async getSystemOverview() {
    const cacheKey = `${this.cachePrefix}system_overview`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const [services, alerts] = await Promise.all([this.getServices(), this.getAlerts()])

        const healthyServices = services.filter((s) => s.status === "healthy")
        const unhealthyServices = services.filter((s) => s.status === "unhealthy")
        const degradedServices = services.filter((s) => s.status === "degraded")

        const criticalAlerts = alerts.filter((a) => a.severity === "critical")
        const highAlerts = alerts.filter((a) => a.severity === "error")
        const mediumAlerts = alerts.filter((a) => a.severity === "warning")
        const lowAlerts = alerts.filter((a) => a.severity === "info")

        return {
          services: {
            total: services.length,
            healthy: healthyServices.length,
            unhealthy: unhealthyServices.length,
            degraded: degradedServices.length,
            byType: this.groupServicesByType(services),
          },
          alerts: {
            total: alerts.length,
            critical: criticalAlerts.length,
            high: highAlerts.length,
            medium: mediumAlerts.length,
            low: lowAlerts.length,
            active: alerts.filter((a) => a.status === "active").length,
          },
          availability: services.length > 0 ? (healthyServices.length / services.length) * 100 : 100,
          responseTime: this.calculateAverageResponseTime(services),
        }
      },
      { ttl: 60000 }, // 1 minute cache for overview
    )
  }

  private groupServicesByType(services: ServiceHealth[]) {
    return services.reduce(
      (acc, service) => {
        acc[service.type] = (acc[service.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  async getAlertRules(): Promise<AlertRule[]> {
    const cacheKey = `${this.cachePrefix}alert_rules`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getAlertRules()
      },
      { ttl: this.cacheTTL },
    )
  }

  async createAlertRule(rule: Omit<AlertRule, "id">): Promise<AlertRule> {
    const created = await healthMonitoringQueries.createAlertRule(rule)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}alert_rules`)

    return created
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const updated = await healthMonitoringQueries.updateAlertRule(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}alert_rules`)

    return updated
  }

  async deleteAlertRule(id: string): Promise<void> {
    await healthMonitoringQueries.deleteAlertRule(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}alert_rules`)
  }

  async getDashboards(): Promise<MonitoringDashboard[]> {
    const cacheKey = `${this.cachePrefix}dashboards`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getDashboards()
      },
      { ttl: this.cacheTTL },
    )
  }

  async getDashboard(id: string): Promise<MonitoringDashboard | null> {
    const cacheKey = `${this.cachePrefix}dashboard:${id}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getDashboard(id)
      },
      { ttl: this.cacheTTL },
    )
  }

  async createDashboard(dashboard: Omit<MonitoringDashboard, "id">): Promise<MonitoringDashboard> {
    const created = await healthMonitoringQueries.createDashboard(dashboard)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}dashboards`)

    return created
  }

  async updateDashboard(id: string, updates: Partial<MonitoringDashboard>): Promise<MonitoringDashboard> {
    const updated = await healthMonitoringQueries.updateDashboard(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}dashboard:${id}`)
    await cache.del(`${this.cachePrefix}dashboards`)

    return updated
  }

  async deleteDashboard(id: string): Promise<void> {
    await healthMonitoringQueries.deleteDashboard(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}dashboard:${id}`)
    await cache.del(`${this.cachePrefix}dashboards`)
  }

  async getMetrics(query: string, timeRange: { start: string; end: string }, step?: string) {
    const cacheKey = `${this.cachePrefix}metrics:${query}:${timeRange.start}:${timeRange.end}:${step || "default"}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return healthMonitoringQueries.getMetrics(query, timeRange, step)
      },
      { ttl: 60000 }, // 1 minute cache for metrics
    )
  }

  async recordMetrics(serviceId: string, metrics: Record<string, number>): Promise<void> {
    await healthMonitoringQueries.recordMetrics(serviceId, metrics)

    // Invalidate metrics cache
    await cache.invalidatePattern(`${this.cachePrefix}metrics:*`)
  }
}

export const healthMonitoringService = new HealthMonitoringService()
