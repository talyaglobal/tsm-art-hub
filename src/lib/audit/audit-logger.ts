import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logging/structured-logger"

export interface AuditEvent {
  id: string
  timestamp: string
  userId: string
  userEmail?: string
  tenantId?: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  sessionId?: string
  outcome: "success" | "failure" | "partial"
  severity: "low" | "medium" | "high" | "critical"
  category: "authentication" | "authorization" | "data" | "configuration" | "system" | "security"
  metadata: Record<string, any>
}

export interface AuditContext {
  userId: string
  userEmail?: string
  tenantId?: string
  ipAddress: string
  userAgent: string
  sessionId?: string
}

export class AuditLogger {
  private supabase = createClient()

  async logEvent(
    action: string,
    resource: string,
    context: AuditContext,
    options: {
      resourceId?: string
      details?: Record<string, any>
      outcome?: AuditEvent["outcome"]
      severity?: AuditEvent["severity"]
      category?: AuditEvent["category"]
      metadata?: Record<string, any>
    } = {},
  ): Promise<void> {
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      userEmail: context.userEmail,
      tenantId: context.tenantId,
      action,
      resource,
      resourceId: options.resourceId,
      details: options.details || {},
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      outcome: options.outcome || "success",
      severity: options.severity || "low",
      category: options.category || "data",
      metadata: options.metadata || {},
    }

    try {
      // Store in audit log table
      await this.supabase.from("audit_logs").insert({
        id: auditEvent.id,
        timestamp: auditEvent.timestamp,
        user_id: auditEvent.userId,
        user_email: auditEvent.userEmail,
        tenant_id: auditEvent.tenantId,
        action: auditEvent.action,
        resource: auditEvent.resource,
        resource_id: auditEvent.resourceId,
        details: auditEvent.details,
        ip_address: auditEvent.ipAddress,
        user_agent: auditEvent.userAgent,
        session_id: auditEvent.sessionId,
        outcome: auditEvent.outcome,
        severity: auditEvent.severity,
        category: auditEvent.category,
        metadata: auditEvent.metadata,
      })

      // Also log to structured logger for real-time monitoring
      logger
        .withContext({
          userId: context.userId,
          tenantId: context.tenantId,
        })
        .info(`Audit: ${action} on ${resource}`, {
          audit: auditEvent,
        })

      // Trigger security alerts for high-severity events
      if (auditEvent.severity === "critical" || auditEvent.severity === "high") {
        await this.triggerSecurityAlert(auditEvent)
      }
    } catch (error) {
      logger.error("Failed to log audit event", error as Error, { auditEvent })
    }
  }

  // Convenience methods for common audit events
  async logAuthentication(
    action: "login" | "logout" | "login_failed" | "password_reset" | "mfa_enabled" | "mfa_disabled",
    context: AuditContext,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.logEvent(action, "authentication", context, {
      details,
      category: "authentication",
      severity: action.includes("failed") ? "medium" : "low",
      outcome: action.includes("failed") ? "failure" : "success",
    })
  }

  async logAuthorization(
    action: "access_granted" | "access_denied" | "permission_changed",
    resource: string,
    context: AuditContext,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.logEvent(action, resource, context, {
      details,
      category: "authorization",
      severity: action === "access_denied" ? "medium" : "low",
      outcome: action === "access_denied" ? "failure" : "success",
    })
  }

  async logDataAccess(
    action: "read" | "create" | "update" | "delete" | "export" | "import",
    resource: string,
    context: AuditContext,
    options: {
      resourceId?: string
      recordCount?: number
      fields?: string[]
      details?: Record<string, any>
    } = {},
  ): Promise<void> {
    await this.logEvent(action, resource, context, {
      resourceId: options.resourceId,
      details: {
        recordCount: options.recordCount,
        fields: options.fields,
        ...options.details,
      },
      category: "data",
      severity: action === "delete" || action === "export" ? "medium" : "low",
    })
  }

  async logConfigurationChange(
    action: string,
    resource: string,
    context: AuditContext,
    options: {
      resourceId?: string
      oldValues?: Record<string, any>
      newValues?: Record<string, any>
      details?: Record<string, any>
    } = {},
  ): Promise<void> {
    await this.logEvent(action, resource, context, {
      resourceId: options.resourceId,
      details: {
        oldValues: options.oldValues,
        newValues: options.newValues,
        ...options.details,
      },
      category: "configuration",
      severity: "medium",
    })
  }

  async logSecurityEvent(
    action: string,
    context: AuditContext,
    options: {
      threat?: string
      blocked?: boolean
      details?: Record<string, any>
    } = {},
  ): Promise<void> {
    await this.logEvent(action, "security", context, {
      details: {
        threat: options.threat,
        blocked: options.blocked,
        ...options.details,
      },
      category: "security",
      severity: options.blocked ? "medium" : "critical",
      outcome: options.blocked ? "success" : "failure",
    })
  }

  async logSystemEvent(
    action: string,
    resource: string,
    context: AuditContext,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.logEvent(action, resource, context, {
      details,
      category: "system",
      severity: "low",
    })
  }

  private async triggerSecurityAlert(auditEvent: AuditEvent): Promise<void> {
    // This would integrate with your alerting system
    logger
      .withContext({
        userId: auditEvent.userId,
        tenantId: auditEvent.tenantId,
      })
      .warn(`Security Alert: ${auditEvent.action} on ${auditEvent.resource}`, {
        securityAlert: {
          auditEventId: auditEvent.id,
          severity: auditEvent.severity,
          category: auditEvent.category,
          outcome: auditEvent.outcome,
        },
      })
  }

  async searchAuditLogs(filters: {
    userId?: string
    tenantId?: string
    action?: string
    resource?: string
    category?: AuditEvent["category"][]
    severity?: AuditEvent["severity"][]
    outcome?: AuditEvent["outcome"][]
    startTime?: string
    endTime?: string
    ipAddress?: string
    limit?: number
    offset?: number
  }): Promise<AuditEvent[]> {
    let query = this.supabase.from("audit_logs").select("*").order("timestamp", { ascending: false })

    if (filters.userId) {
      query = query.eq("user_id", filters.userId)
    }

    if (filters.tenantId) {
      query = query.eq("tenant_id", filters.tenantId)
    }

    if (filters.action) {
      query = query.ilike("action", `%${filters.action}%`)
    }

    if (filters.resource) {
      query = query.ilike("resource", `%${filters.resource}%`)
    }

    if (filters.category?.length) {
      query = query.in("category", filters.category)
    }

    if (filters.severity?.length) {
      query = query.in("severity", filters.severity)
    }

    if (filters.outcome?.length) {
      query = query.in("outcome", filters.outcome)
    }

    if (filters.startTime) {
      query = query.gte("timestamp", filters.startTime)
    }

    if (filters.endTime) {
      query = query.lte("timestamp", filters.endTime)
    }

    if (filters.ipAddress) {
      query = query.eq("ip_address", filters.ipAddress)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to search audit logs: ${error.message}`)
    }

    return (data || []).map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      userEmail: row.user_email,
      tenantId: row.tenant_id,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      details: row.details || {},
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      outcome: row.outcome,
      severity: row.severity,
      category: row.category,
      metadata: row.metadata || {},
    }))
  }

  async generateComplianceReport(
    tenantId: string,
    startDate: string,
    endDate: string,
    options: {
      includeCategories?: AuditEvent["category"][]
      format?: "json" | "csv" | "pdf"
    } = {},
  ): Promise<{
    summary: Record<string, number>
    events: AuditEvent[]
    reportId: string
    generatedAt: string
  }> {
    const events = await this.searchAuditLogs({
      tenantId,
      startTime: startDate,
      endTime: endDate,
      category: options.includeCategories,
      limit: 10000,
    })

    const summary = {
      totalEvents: events.length,
      successfulEvents: events.filter((e) => e.outcome === "success").length,
      failedEvents: events.filter((e) => e.outcome === "failure").length,
      criticalEvents: events.filter((e) => e.severity === "critical").length,
      highSeverityEvents: events.filter((e) => e.severity === "high").length,
      authenticationEvents: events.filter((e) => e.category === "authentication").length,
      dataAccessEvents: events.filter((e) => e.category === "data").length,
      configurationChanges: events.filter((e) => e.category === "configuration").length,
      securityEvents: events.filter((e) => e.category === "security").length,
    }

    const reportId = `compliance_${tenantId}_${Date.now()}`

    return {
      summary,
      events,
      reportId,
      generatedAt: new Date().toISOString(),
    }
  }
}

export const auditLogger = new AuditLogger()
