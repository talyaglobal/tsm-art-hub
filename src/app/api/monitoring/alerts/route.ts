import { type NextRequest, NextResponse } from "next/server"
import { healthMonitoringService } from "@/lib/services/health-monitoring-service"
import { healthMonitoringQueries } from "@/lib/database/health-monitoring-queries"
import { withAuth } from "@/lib/middleware/auth"
import { withRateLimit, rateLimitConfigs } from "@/lib/middleware/rate-limit"

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const service = searchParams.get("service")

    const alerts = await healthMonitoringQueries.getMonitoringAlerts(status || undefined, service || undefined)

    return NextResponse.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get alerts:", error)
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

    const alert = await healthMonitoringService.createAlert(body)

    return NextResponse.json(
      {
        success: true,
        data: alert,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create alert:", error)
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
