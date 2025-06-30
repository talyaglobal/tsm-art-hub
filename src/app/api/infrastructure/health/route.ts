import { type NextRequest, NextResponse } from "next/server"
import { infrastructureService } from "@/lib/services/infrastructure-service"
import { withAuth } from "@/lib/middleware/auth"
import { withRateLimit, rateLimitConfigs } from "@/lib/middleware/rate-limit"

async function handlePUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceId, status, metrics } = body

    if (!instanceId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "instanceId and status are required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const updatedInstance = await infrastructureService.updateInstanceHealth(instanceId, status, metrics)

    return NextResponse.json({
      success: true,
      data: updatedInstance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to update instance health:", error)
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

export const PUT = withRateLimit(rateLimitConfigs.api)(withAuth(handlePUT))
