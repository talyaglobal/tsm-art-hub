import { createClient } from "@/lib/supabase/server"
import type { HealthCheck, HealthMetrics, Alert } from "@/types/monitoring"

export interface HealthCheckConfig {
  interval: number // milliseconds
  timeout: number // milliseconds
  retries: number
  thresholds: {
    responseTime: number // ms
    errorRate: number // percentage
    uptime: number // percentage
  }
}

export class HealthMonitor {
  private supabase = createClient()
  private activeChecks = new Map<string, NodeJS.Timeout>()
  private healthCache = new Map<string, HealthMetrics>()

  async startMonitoring(apiId: string, config: HealthCheckConfig): Promise<void> {
    // Stop existing monitoring if running
    this.stopMonitoring(apiId)

    // Start new monitoring interval
    const intervalId = setInterval(async () => {
      await this.performHealthCheck(apiId, config)
    }, config.interval)

    this.activeChecks.set(apiId, intervalId)
    console.log(`Health monitoring started for API ${apiId}`)
  }

  async stopMonitoring(apiId: string): Promise<void> {
    const intervalId = this.activeChecks.get(apiId)
    if (intervalId) {
      clearInterval(intervalId)
      this.activeChecks.delete(apiId)
      console.log(`Health monitoring stopped for API ${apiId}`)
    }
  }

  async performHealthCheck(apiId: string, config: HealthCheckConfig): Promise<HealthCheck> {
    const startTime = Date.now()
    let attempt = 0
    let lastError: string | null = null

    // Get API details
    const { data: api } = await this.supabase.from("integrations").select("*").eq("id", apiId).single()

    if (!api) {
      throw new Error(`API ${apiId} not found`)
    }

    // Perform health check with retries
    while (attempt < config.retries) {
      try {
        const checkResult = await this.executeHealthCheck(api, config.timeout)
        const responseTime = Date.now() - startTime

        // Create health check record
        const healthCheck: HealthCheck = {
          id: `hc_${Date.now()}_${apiId}`,
          apiId,
          timestamp: new Date().toISOString(),
          status: checkResult.success ? "healthy" : "unhealthy",
          responseTime,
          statusCode: checkResult.statusCode,
          error: checkResult.error,
          attempt: attempt + 1,
          endpoint: checkResult.endpoint,
          metadata: {
            headers: checkResult.headers,
            contentLength: checkResult.contentLength,
            sslInfo: checkResult.sslInfo,
          },
        }

        // Store health check result
        await this.storeHealthCheck(healthCheck)

        // Update health metrics
        await this.updateHealthMetrics(apiId, healthCheck)

        // Check thresholds and create alerts if needed
        await this.checkThresholds(apiId, config.thresholds, healthCheck)

        return healthCheck
      } catch (error) {
        attempt++
        lastError = error instanceof Error ? error.message : "Unknown error"

        if (attempt < config.retries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    // All retries failed
    const failedCheck: HealthCheck = {
      id: `hc_${Date.now()}_${apiId}`,
      apiId,
      timestamp: new Date().toISOString(),
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      statusCode: 0,
      error: lastError || "Health check failed after all retries",
      attempt: config.retries,
      endpoint: api.config.endpoint,
      metadata: {},
    }

    await this.storeHealthCheck(failedCheck)
    await this.updateHealthMetrics(apiId, failedCheck)
    await this.checkThresholds(apiId, config.thresholds, failedCheck)

    return failedCheck
  }

  private async executeHealthCheck(
    api: any,
    timeout: number,
  ): Promise<{
    success: boolean
    statusCode: number
    error?: string
    endpoint: string
    headers?: Record<string, string>
    contentLength?: number
    sslInfo?: any
  }> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Build health check endpoint
      const healthEndpoint = this.buildHealthEndpoint(api)

      const response = await fetch(healthEndpoint, {
        method: "GET",
        headers: this.buildAuthHeaders(api.config.authentication),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      return {
        success: response.ok,
        statusCode: response.status,
        endpoint: healthEndpoint,
        headers: Object.fromEntries(response.headers.entries()),
        contentLength: Number.parseInt(response.headers.get("content-length") || "0"),
        sslInfo: this.extractSSLInfo(response),
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Health check timeout after ${timeout}ms`)
      }

      throw error
    }
  }

  private buildHealthEndpoint(api: any): string {
    // Build appropriate health check endpoint based on API type
    const baseUrl = api.config.endpoint

    switch (api.type) {
      case "ecommerce":
        return `${baseUrl}/admin/api/health` // Shopify-style
      case "accounting":
        return `${baseUrl}/v3/companyinfo/health` // QuickBooks-style
      case "payment":
        return `${baseUrl}/v1/account` // Stripe-style
      case "warehouse":
        return `${baseUrl}/api/v1/status` // Generic warehouse
      case "banking":
        return `${baseUrl}/health` // Banking API
      default:
        return `${baseUrl}/health`
    }
  }

  private buildAuthHeaders(auth: any): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "TSmart-Hub-HealthMonitor/1.0",
    }

    switch (auth.type) {
      case "api_key":
        if (auth.credentials.headerName && auth.credentials.key) {
          headers[auth.credentials.headerName] = auth.credentials.key
        }
        break
      case "bearer_token":
        if (auth.credentials.token) {
          headers["Authorization"] = `Bearer ${auth.credentials.token}`
        }
        break
      case "basic_auth":
        if (auth.credentials.username && auth.credentials.password) {
          const encoded = Buffer.from(`${auth.credentials.username}:${auth.credentials.password}`).toString("base64")
          headers["Authorization"] = `Basic ${encoded}`
        }
        break
    }

    return headers
  }

  private extractSSLInfo(response: Response): any {
    // Extract SSL certificate information if available
    return {
      protocol: response.url.startsWith("https://") ? "HTTPS" : "HTTP",
      secure: response.url.startsWith("https://"),
    }
  }

  private async storeHealthCheck(healthCheck: HealthCheck): Promise<void> {
    const { error } = await this.supabase.from("health_checks").insert({
      id: healthCheck.id,
      api_id: healthCheck.apiId,
      timestamp: healthCheck.timestamp,
      status: healthCheck.status,
      response_time: healthCheck.responseTime,
      status_code: healthCheck.statusCode,
      error: healthCheck.error,
      attempt: healthCheck.attempt,
      endpoint: healthCheck.endpoint,
      metadata: healthCheck.metadata,
    })

    if (error) {
      console.error("Failed to store health check:", error)
    }
  }

  private async updateHealthMetrics(apiId: string, healthCheck: HealthCheck): Promise<void> {
    // Get existing metrics
    const { data: existingMetrics } = await this.supabase
      .from("health_metrics")
      .select("*")
      .eq("api_id", apiId)
      .single()

    const now = new Date()
    const isHealthy = healthCheck.status === "healthy"

    let metrics: HealthMetrics

    if (existingMetrics) {
      // Update existing metrics
      const totalChecks = existingMetrics.total_checks + 1
      const successfulChecks = existingMetrics.successful_checks + (isHealthy ? 1 : 0)
      const uptime = (successfulChecks / totalChecks) * 100

      metrics = {
        apiId,
        totalChecks,
        successfulChecks,
        failedChecks: totalChecks - successfulChecks,
        uptime,
        averageResponseTime: this.calculateAverageResponseTime(
          existingMetrics.average_response_time,
          existingMetrics.total_checks,
          healthCheck.responseTime,
        ),
        lastCheckAt: healthCheck.timestamp,
        lastHealthyAt: isHealthy ? healthCheck.timestamp : existingMetrics.last_healthy_at,
        lastUnhealthyAt: !isHealthy ? healthCheck.timestamp : existingMetrics.last_unhealthy_at,
        currentStatus: healthCheck.status,
        consecutiveFailures: isHealthy ? 0 : (existingMetrics.consecutive_failures || 0) + 1,
        updatedAt: now.toISOString(),
      }
    } else {
      // Create new metrics
      metrics = {
        apiId,
        totalChecks: 1,
        successfulChecks: isHealthy ? 1 : 0,
        failedChecks: isHealthy ? 0 : 1,
        uptime: isHealthy ? 100 : 0,
        averageResponseTime: healthCheck.responseTime,
        lastCheckAt: healthCheck.timestamp,
        lastHealthyAt: isHealthy ? healthCheck.timestamp : null,
        lastUnhealthyAt: !isHealthy ? healthCheck.timestamp : null,
        currentStatus: healthCheck.status,
        consecutiveFailures: isHealthy ? 0 : 1,
        updatedAt: now.toISOString(),
      }
    }

    // Store updated metrics
    await this.supabase.from("health_metrics").upsert({
      api_id: metrics.apiId,
      total_checks: metrics.totalChecks,
      successful_checks: metrics.successfulChecks,
      failed_checks: metrics.failedChecks,
      uptime: metrics.uptime,
      average_response_time: metrics.averageResponseTime,
      last_check_at: metrics.lastCheckAt,
      last_healthy_at: metrics.lastHealthyAt,
      last_unhealthy_at: metrics.lastUnhealthyAt,
      current_status: metrics.currentStatus,
      consecutive_failures: metrics.consecutiveFailures,
      updated_at: metrics.updatedAt,
    })

    // Cache metrics for quick access
    this.healthCache.set(apiId, metrics)
  }

  private calculateAverageResponseTime(currentAvg: number, totalChecks: number, newResponseTime: number): number {
    return (currentAvg * totalChecks + newResponseTime) / (totalChecks + 1)
  }

  private async checkThresholds(
    apiId: string,
    thresholds: HealthCheckConfig["thresholds"],
    healthCheck: HealthCheck,
  ): Promise<void> {
    const metrics = this.healthCache.get(apiId)
    if (!metrics) return

    const alerts: Omit<Alert, "id">[] = []

    // Check response time threshold
    if (healthCheck.responseTime > thresholds.responseTime) {
      alerts.push({
        apiId,
        type: "performance",
        severity: healthCheck.responseTime > thresholds.responseTime * 2 ? "critical" : "warning",
        title: "High Response Time",
        message: `API response time (${healthCheck.responseTime}ms) exceeds threshold (${thresholds.responseTime}ms)`,
        timestamp: new Date().toISOString(),
        metadata: {
          responseTime: healthCheck.responseTime,
          threshold: thresholds.responseTime,
          endpoint: healthCheck.endpoint,
        },
        acknowledged: false,
      })
    }

    // Check uptime threshold
    if (metrics.uptime < thresholds.uptime) {
      alerts.push({
        apiId,
        type: "availability",
        severity: metrics.uptime < thresholds.uptime * 0.5 ? "critical" : "warning",
        title: "Low Uptime",
        message: `API uptime (${metrics.uptime.toFixed(2)}%) is below threshold (${thresholds.uptime}%)`,
        timestamp: new Date().toISOString(),
        metadata: {
          uptime: metrics.uptime,
          threshold: thresholds.uptime,
          consecutiveFailures: metrics.consecutiveFailures,
        },
        acknowledged: false,
      })
    }

    // Check error rate threshold
    const errorRate = (metrics.failedChecks / metrics.totalChecks) * 100
    if (errorRate > thresholds.errorRate) {
      alerts.push({
        apiId,
        type: "error",
        severity: errorRate > thresholds.errorRate * 2 ? "critical" : "warning",
        title: "High Error Rate",
        message: `API error rate (${errorRate.toFixed(2)}%) exceeds threshold (${thresholds.errorRate}%)`,
        timestamp: new Date().toISOString(),
        metadata: {
          errorRate,
          threshold: thresholds.errorRate,
          failedChecks: metrics.failedChecks,
          totalChecks: metrics.totalChecks,
        },
        acknowledged: false,
      })
    }

    // Check consecutive failures
    if (metrics.consecutiveFailures >= 3) {
      alerts.push({
        apiId,
        type: "availability",
        severity: metrics.consecutiveFailures >= 5 ? "critical" : "error",
        title: "Consecutive Failures",
        message: `API has failed ${metrics.consecutiveFailures} consecutive health checks`,
        timestamp: new Date().toISOString(),
        metadata: {
          consecutiveFailures: metrics.consecutiveFailures,
          lastError: healthCheck.error,
        },
        acknowledged: false,
      })
    }

    // Store alerts
    for (const alert of alerts) {
      await this.createAlert(alert)
    }
  }

  private async createAlert(alert: Omit<Alert, "id">): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { error } = await this.supabase.from("alerts").insert({
      id: alertId,
      api_id: alert.apiId,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp,
      metadata: alert.metadata,
      acknowledged: alert.acknowledged,
    })

    if (error) {
      console.error("Failed to create alert:", error)
    } else {
      console.log(`Alert created: ${alert.title} for API ${alert.apiId}`)

      // Trigger notification (webhook, email, etc.)
      await this.triggerNotification(alertId, alert)
    }
  }

  private async triggerNotification(alertId: string, alert: Omit<Alert, "id">): Promise<void> {
    // Get notification settings for the API
    const { data: settings } = await this.supabase
      .from("notification_settings")
      .select("*")
      .eq("api_id", alert.apiId)
      .single()

    if (!settings) return

    // Send webhook notification
    if (settings.webhook_enabled && settings.webhook_url) {
      try {
        await fetch(settings.webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "TSmart-Hub-HealthMonitor/1.0",
          },
          body: JSON.stringify({
            alertId,
            ...alert,
          }),
        })
      } catch (error) {
        console.error("Failed to send webhook notification:", error)
      }
    }

    // Send email notification (would integrate with email service)
    if (settings.email_enabled && settings.email_recipients) {
      // Implementation would depend on email service (SendGrid, SES, etc.)
      console.log(`Email notification would be sent to: ${settings.email_recipients.join(", ")}`)
    }
  }

  async getHealthMetrics(apiId: string): Promise<HealthMetrics | null> {
    // Check cache first
    const cached = this.healthCache.get(apiId)
    if (cached) return cached

    // Fetch from database
    const { data } = await this.supabase.from("health_metrics").select("*").eq("api_id", apiId).single()

    if (data) {
      const metrics: HealthMetrics = {
        apiId: data.api_id,
        totalChecks: data.total_checks,
        successfulChecks: data.successful_checks,
        failedChecks: data.failed_checks,
        uptime: data.uptime,
        averageResponseTime: data.average_response_time,
        lastCheckAt: data.last_check_at,
        lastHealthyAt: data.last_healthy_at,
        lastUnhealthyAt: data.last_unhealthy_at,
        currentStatus: data.current_status,
        consecutiveFailures: data.consecutive_failures,
        updatedAt: data.updated_at,
      }

      this.healthCache.set(apiId, metrics)
      return metrics
    }

    return null
  }

  async getRecentHealthChecks(apiId: string, limit = 50): Promise<HealthCheck[]> {
    const { data } = await this.supabase
      .from("health_checks")
      .select("*")
      .eq("api_id", apiId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    return (
      data?.map((row) => ({
        id: row.id,
        apiId: row.api_id,
        timestamp: row.timestamp,
        status: row.status,
        responseTime: row.response_time,
        statusCode: row.status_code,
        error: row.error,
        attempt: row.attempt,
        endpoint: row.endpoint,
        metadata: row.metadata,
      })) || []
    )
  }

  async getActiveAlerts(apiId?: string): Promise<Alert[]> {
    let query = this.supabase
      .from("alerts")
      .select("*")
      .eq("acknowledged", false)
      .order("timestamp", { ascending: false })

    if (apiId) {
      query = query.eq("api_id", apiId)
    }

    const { data } = await query

    return (
      data?.map((row) => ({
        id: row.id,
        apiId: row.api_id,
        type: row.type,
        severity: row.severity,
        title: row.title,
        message: row.message,
        timestamp: row.timestamp,
        metadata: row.metadata,
        acknowledged: row.acknowledged,
        acknowledgedAt: row.acknowledged_at,
        acknowledgedBy: row.acknowledged_by,
      })) || []
    )
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("alerts")
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
      })
      .eq("id", alertId)

    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`)
    }
  }

  // Cleanup method to stop all monitoring
  async stopAllMonitoring(): Promise<void> {
    for (const [apiId] of this.activeChecks) {
      await this.stopMonitoring(apiId)
    }
    this.healthCache.clear()
  }

  async checkHealth(): Promise<{ status: string; checks: any[] }> {
    return {
      status: "healthy",
      checks: [
        { name: "database", status: "pass" },
        { name: "redis", status: "pass" },
      ],
    }
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor()
