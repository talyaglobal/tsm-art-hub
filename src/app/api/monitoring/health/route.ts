import { type NextRequest, NextResponse } from "next/server"
import { healthMonitoringService } from "@/lib/services/health-monitoring-service"
import { healthMonitoringQueries } from "@/lib/database/health-monitoring-queries"
import { withAuth } from "@/lib/middleware/auth"
import { withRateLimit, rateLimitConfigs } from "@/lib/middleware/rate-limit"

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiId = searchParams.get("apiId")

    const healthStatus = await healthMonitoringQueries.getApiHealthStatus(apiId || undefined)

    return NextResponse.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get health status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiId, status, responseTime, uptime, errorRate, metadata } = body

    if (!apiId || !status || responseTime === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "apiId, status, and responseTime are required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const updatedHealth = await healthMonitoringService.updateApiHealth(apiId, {
      status,
      responseTime,
      uptime,
      errorRate,
      metadata,
    })

    return NextResponse.json({
      success: true,
      data: updatedHealth,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to update health status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export const GET = withRateLimit(rateLimitConfigs.api)(withAuth(handleGET))
export const POST = withRateLimit(rateLimitConfigs.api)(withAuth(handlePOST))
