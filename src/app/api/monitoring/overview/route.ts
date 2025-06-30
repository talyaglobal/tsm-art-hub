import { type NextRequest, NextResponse } from "next/server"
import { healthMonitoringService } from "@/lib/services/health-monitoring-service"
import { withAuth } from "@/lib/middleware/auth"
import { withRateLimit, rateLimitConfigs } from "@/lib/middleware/rate-limit"

async function handleGET(request: NextRequest) {
  try {
    const overview = await healthMonitoringService.getSystemOverview()

    return NextResponse.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get system overview:", error)
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
