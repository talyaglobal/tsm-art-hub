import { type NextRequest, NextResponse } from "next/server"
import { infrastructureService } from "@/lib/services/infrastructure-service"
import { infrastructureQueries } from "@/lib/database/infrastructure-queries"
import { withAuth } from "@/lib/middleware/auth"
import { withRateLimit, rateLimitConfigs } from "@/lib/middleware/rate-limit"

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get("service")

    const instances = await infrastructureQueries.getServiceInstances(service || undefined)

    return NextResponse.json({
      success: true,
      data: instances,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get service instances:", error)
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

    const instance = await infrastructureService.registerServiceInstance(body)

    return NextResponse.json(
      {
        success: true,
        data: instance,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create service instance:", error)
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
