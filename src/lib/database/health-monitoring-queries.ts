import { createClient } from "@/lib/supabase/server"
import type { ServiceHealth, HealthReport, AlertRule, MonitoringDashboard } from "@/types/health-monitoring"

export class HealthMonitoringQueries {
  private supabase = createClient()

  async getServices(filters?: {
    type?: string
    status?: string
    region?: string
  }): Promise<ServiceHealth[]> {
    try {
      let query = this.supabase.from("service_health").select("*")

      if (filters?.type) {
        query = query.eq("type", filters.type)
      }
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }
      if (filters?.region) {
        query = query.eq("metadata->>region", filters.region)
      }

      const { data, error } = await query.order("last_check", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch services: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching services:", error)
      throw error
    }
  }

  async getService(id: string): Promise<ServiceHealth | null> {
    try {
      const { data, error } = await this.supabase.from("service_health").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch service: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching service:", error)
      throw error
    }
  }

  async createService(service: Omit<ServiceHealth, "id">): Promise<ServiceHealth> {
    try {
      const { data, error } = await this.supabase.from("service_health").insert(service).select().single()

      if (error) {
        throw new Error(`Failed to create service: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating service:", error)
      throw error
    }
  }

  async updateService(id: string, updates: Partial<ServiceHealth>): Promise<ServiceHealth> {
    try {
      const { data, error } = await this.supabase
        .from("service_health")
        .update({ ...updates, last_check: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update service: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating service:", error)
      throw error
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("service_health").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete service: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      throw error
    }
  }

  async recordHealthCheck(serviceId: string, check: any): Promise<void> {
    try {
      const { error } = await this.supabase.from("health_checks").insert({
        service_id: serviceId,
        timestamp: new Date().toISOString(),
        ...check,
      })

      if (error) {
        throw new Error(`Failed to record health check: ${error.message}`)
      }
    } catch (error) {
      console.error("Error recording health check:", error)
      throw error
    }
  }

  async getHealthChecks(serviceId: string, timeRange: { start: string; end: string }): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("health_checks")
        .select("*")
        .eq("service_id", serviceId)
        .gte("timestamp", timeRange.start)
        .lte("timestamp", timeRange.end)
        .order("timestamp", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch health checks: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching health checks:", error)
      throw error
    }
  }

  async getAlerts(filters?: {
    severity?: string
    status?: string
    serviceId?: string
  }): Promise<any[]> {
    try {
      let query = this.supabase.from("service_alerts").select("*")

      if (filters?.severity) {
        query = query.eq("severity", filters.severity)
      }
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }
      if (filters?.serviceId) {
        query = query.eq("service_id", filters.serviceId)
      }

      const { data, error } = await query.order("timestamp", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch alerts: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching alerts:", error)
      throw error
    }
  }

  async createAlert(alert: any): Promise<any> {
    try {
      const { data, error } = await this.supabase.from("service_alerts").insert(alert).select().single()

      if (error) {
        throw new Error(`Failed to create alert: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating alert:", error)
      throw error
    }
  }

  async updateAlert(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await this.supabase.from("service_alerts").update(updates).eq("id", id).select().single()

      if (error) {
        throw new Error(`Failed to update alert: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating alert:", error)
      throw error
    }
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from("service_alerts")
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: acknowledgedBy,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to acknowledge alert: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error acknowledging alert:", error)
      throw error
    }
  }

  async resolveAlert(id: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from("service_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to resolve alert: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error resolving alert:", error)
      throw error
    }
  }

  async getHealthReports(limit = 10): Promise<HealthReport[]> {
    try {
      const { data, error } = await this.supabase
        .from("health_reports")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to fetch health reports: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching health reports:", error)
      throw error
    }
  }

  async createHealthReport(report: Omit<HealthReport, "id">): Promise<HealthReport> {
    try {
      const { data, error } = await this.supabase.from("health_reports").insert(report).select().single()

      if (error) {
        throw new Error(`Failed to create health report: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating health report:", error)
      throw error
    }
  }

  async getAlertRules(): Promise<AlertRule[]> {
    try {
      const { data, error } = await this.supabase
        .from("alert_rules")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch alert rules: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching alert rules:", error)
      throw error
    }
  }

  async createAlertRule(rule: Omit<AlertRule, "id">): Promise<AlertRule> {
    try {
      const { data, error } = await this.supabase.from("alert_rules").insert(rule).select().single()

      if (error) {
        throw new Error(`Failed to create alert rule: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating alert rule:", error)
      throw error
    }
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    try {
      const { data, error } = await this.supabase
        .from("alert_rules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update alert rule: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating alert rule:", error)
      throw error
    }
  }

  async deleteAlertRule(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("alert_rules").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete alert rule: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting alert rule:", error)
      throw error
    }
  }

  async getDashboards(): Promise<MonitoringDashboard[]> {
    try {
      const { data, error } = await this.supabase
        .from("monitoring_dashboards")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch dashboards: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching dashboards:", error)
      throw error
    }
  }

  async getDashboard(id: string): Promise<MonitoringDashboard | null> {
    try {
      const { data, error } = await this.supabase.from("monitoring_dashboards").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch dashboard: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      throw error
    }
  }

  async createDashboard(dashboard: Omit<MonitoringDashboard, "id">): Promise<MonitoringDashboard> {
    try {
      const { data, error } = await this.supabase.from("monitoring_dashboards").insert(dashboard).select().single()

      if (error) {
        throw new Error(`Failed to create dashboard: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating dashboard:", error)
      throw error
    }
  }

  async updateDashboard(id: string, updates: Partial<MonitoringDashboard>): Promise<MonitoringDashboard> {
    try {
      const { data, error } = await this.supabase
        .from("monitoring_dashboards")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update dashboard: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating dashboard:", error)
      throw error
    }
  }

  async deleteDashboard(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("monitoring_dashboards").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete dashboard: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting dashboard:", error)
      throw error
    }
  }

  async getMetrics(query: string, timeRange: { start: string; end: string }, step?: string): Promise<any[]> {
    try {
      // This would typically query a time-series database like Prometheus
      // For now, return mock data
      const { data, error } = await this.supabase
        .from("service_metrics")
        .select("*")
        .gte("timestamp", timeRange.start)
        .lte("timestamp", timeRange.end)
        .order("timestamp", { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch metrics: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching metrics:", error)
      throw error
    }
  }

  async recordMetrics(serviceId: string, metrics: Record<string, number>): Promise<void> {
    try {
      const { error } = await this.supabase.from("service_metrics").insert({
        service_id: serviceId,
        timestamp: new Date().toISOString(),
        metrics,
      })

      if (error) {
        throw new Error(`Failed to record metrics: ${error.message}`)
      }
    } catch (error) {
      console.error("Error recording metrics:", error)
      throw error
    }
  }
}

export const healthMonitoringQueries = new HealthMonitoringQueries()
