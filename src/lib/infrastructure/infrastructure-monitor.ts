interface InfrastructureMetric {
  timestamp: Date
  service: string
  metric: string
  value: number
  unit: string
  tags: Record<string, string>
}

interface ServiceHealth {
  service: string
  status: "healthy" | "degraded" | "unhealthy"
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: Date
  issues: string[]
}

interface Alert {
  id: string
  service: string
  metric: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  threshold: number
  currentValue: number
  triggeredAt: Date
  acknowledged: boolean
  resolvedAt?: Date
}

interface MonitoringRule {
  id: string
  name: string
  service: string
  metric: string
  condition: "greater_than" | "less_than" | "equals" | "not_equals"
  threshold: number
  duration: number // seconds
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
}

class InfrastructureMonitor {
  private metrics: InfrastructureMetric[] = []
  private serviceHealth: Map<string, ServiceHealth> = new Map()
  private alerts: Map<string, Alert> = new Map()
  private rules: Map<string, MonitoringRule> = new Map()
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map()

  async recordMetric(metric: InfrastructureMetric): Promise<void> {
    this.metrics.push(metric)

    // Keep only recent metrics (last 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff)

    // Check monitoring rules
    await this.checkRules(metric)
  }

  async updateServiceHealth(service: string, health: Partial<ServiceHealth>): Promise<void> {
    const existing = this.serviceHealth.get(service) || {
      service,
      status: "healthy",
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      lastCheck: new Date(),
      issues: [],
    }

    const updated = { ...existing, ...health, lastCheck: new Date() }
    this.serviceHealth.set(service, updated)

    // Generate alerts based on health status
    if (updated.status === "unhealthy") {
      await this.createAlert({
        service,
        metric: "health_status",
        severity: "critical",
        message: `Service ${service} is unhealthy`,
        threshold: 0,
        currentValue: 1,
        issues: updated.issues,
      })
    }
  }

  async createMonitoringRule(rule: MonitoringRule): Promise<void> {
    this.rules.set(rule.id, rule)
  }

  async updateMonitoringRule(ruleId: string, updates: Partial<MonitoringRule>): Promise<boolean> {
    const rule = this.rules.get(ruleId)
    if (!rule) return false

    Object.assign(rule, updates)
    return true
  }

  async deleteMonitoringRule(ruleId: string): Promise<boolean> {
    return this.rules.delete(ruleId)
  }

  async getMetrics(service?: string, metric?: string, since?: Date): Promise<InfrastructureMetric[]> {
    let filtered = this.metrics

    if (service) {
      filtered = filtered.filter((m) => m.service === service)
    }

    if (metric) {
      filtered = filtered.filter((m) => m.metric === metric)
    }

    if (since) {
      filtered = filtered.filter((m) => m.timestamp >= since)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async getServiceHealth(service?: string): Promise<ServiceHealth[]> {
    const health = Array.from(this.serviceHealth.values())

    if (service) {
      const serviceHealth = this.serviceHealth.get(service)
      return serviceHealth ? [serviceHealth] : []
    }

    return health
  }

  async getAlerts(service?: string, severity?: string): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values())

    if (service) {
      alerts = alerts.filter((a) => a.service === service)
    }

    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity)
    }

    return alerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.acknowledged = true
    return true
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.resolvedAt = new Date()
    return true
  }

  async getSystemOverview(): Promise<{
    totalServices: number
    healthyServices: number
    degradedServices: number
    unhealthyServices: number
    activeAlerts: number
    criticalAlerts: number
    averageResponseTime: number
    totalUptime: number
  }> {
    const services = Array.from(this.serviceHealth.values())
    const alerts = Array.from(this.alerts.values()).filter((a) => !a.resolvedAt)

    return {
      totalServices: services.length,
      healthyServices: services.filter((s) => s.status === "healthy").length,
      degradedServices: services.filter((s) => s.status === "degraded").length,
      unhealthyServices: services.filter((s) => s.status === "unhealthy").length,
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
      averageResponseTime: services.reduce((sum, s) => sum + s.responseTime, 0) / services.length || 0,
      totalUptime: services.reduce((sum, s) => sum + s.uptime, 0) / services.length || 0,
    }
  }

  async startMonitoring(service: string, interval = 60): Promise<void> {
    // Stop existing monitoring if any
    this.stopMonitoring(service)

    const monitoringInterval = setInterval(async () => {
      await this.performHealthCheck(service)
      await this.collectMetrics(service)
    }, interval * 1000)

    this.monitoringIntervals.set(service, monitoringInterval)
  }

  async stopMonitoring(service: string): Promise<void> {
    const interval = this.monitoringIntervals.get(service)
    if (interval) {
      clearInterval(interval)
      this.monitoringIntervals.delete(service)
    }
  }

  private async checkRules(metric: InfrastructureMetric): Promise<void> {
    const applicableRules = Array.from(this.rules.values()).filter(
      (rule) => rule.enabled && rule.service === metric.service && rule.metric === metric.metric,
    )

    for (const rule of applicableRules) {
      const violated = this.isRuleViolated(rule, metric.value)

      if (violated) {
        await this.createAlert({
          service: rule.service,
          metric: rule.metric,
          severity: rule.severity,
          message: `${rule.name}: ${metric.metric} ${rule.condition} ${rule.threshold}`,
          threshold: rule.threshold,
          currentValue: metric.value,
        })
      }
    }
  }

  private isRuleViolated(rule: MonitoringRule, value: number): boolean {
    switch (rule.condition) {
      case "greater_than":
        return value > rule.threshold
      case "less_than":
        return value < rule.threshold
      case "equals":
        return value === rule.threshold
      case "not_equals":
        return value !== rule.threshold
      default:
        return false
    }
  }

  async getSystemHealth(): Promise<{ status: string; services: any[] }> {
    return {
      status: "healthy",
      services: [
        { name: "api", status: "healthy" },
        { name: "database", status: "healthy" },
      ],
    }
  }

  private async performHealthCheck(service: string): Promise<void> {
    // Placeholder for health check logic
  }

  private async collectMetrics(service: string): Promise<void> {
    // Placeholder for metric collection logic
  }

  private async createAlert(alert: Alert): Promise<void> {
    // Placeholder for alert creation logic
  }
}

export const infrastructureMonitor = new InfrastructureMonitor()
