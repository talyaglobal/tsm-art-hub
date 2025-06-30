import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { HealthStatus } from "@/types/monitoring"

export async function GET(request: NextRequest, { params }: { params: { apiId: string } }) {
  try {
    const supabase = createClient()
    const { apiId } = params

    // Get health status for specific API
    const { data: healthData, error } = await supabase
      .from("api_health_status")
      .select("*")
      .eq("api_id", apiId)
      .order("last_check", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    if (!healthData) {
      return NextResponse.json({ error: "API health status not found" }, { status: 404 })
    }

    const healthStatus: HealthStatus = {
      id: healthData.id,
      service: healthData.service_name,
      status: healthData.status,
      lastCheck: new Date(healthData.last_check),
      responseTime: healthData.response_time,
      uptime: healthData.uptime_percentage,
      errorRate: healthData.error_rate,
      metadata: healthData.metadata || {},
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Error fetching API health status:", error)
    return NextResponse.json({ error: "Failed to fetch health status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { apiId: string } }) {
  try {
    const supabase = createClient()
    const { apiId } = params
    const body = await request.json()

    // Perform health check
    const healthCheckResult = await performHealthCheck(apiId, body.endpoint)

    // Store health check result
    const { data, error } = await supabase
      .from("api_health_status")
      .upsert({
        api_id: apiId,
        service_name: body.serviceName || `API-${apiId}`,
        status: healthCheckResult.status,
        last_check: new Date().toISOString(),
        response_time: healthCheckResult.responseTime,
        uptime_percentage: healthCheckResult.uptime,
        error_rate: healthCheckResult.errorRate,
        metadata: healthCheckResult.metadata,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      id: data.id,
      service: data.service_name,
      status: data.status,
      lastCheck: new Date(data.last_check),
      responseTime: data.response_time,
      uptime: data.uptime_percentage,
      errorRate: data.error_rate,
      metadata: data.metadata || {},
    })
  } catch (error) {
    console.error("Error performing health check:", error)
    return NextResponse.json({ error: "Failed to perform health check" }, { status: 500 })
  }
}

async function performHealthCheck(apiId: string, endpoint?: string) {
  const startTime = Date.now()

  try {
    // Default health check endpoint
    const healthEndpoint = endpoint || `/api/health/${apiId}`

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${healthEndpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    const responseTime = Date.now() - startTime
    const isHealthy = response.ok && response.status < 400

    return {
      status: isHealthy ? "healthy" : ("unhealthy" as const),
      responseTime,
      uptime: isHealthy ? 100 : 0,
      errorRate: isHealthy ? 0 : 100,
      metadata: {
        statusCode: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    return {
      status: "unhealthy" as const,
      responseTime,
      uptime: 0,
      errorRate: 100,
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    }
  }
}
