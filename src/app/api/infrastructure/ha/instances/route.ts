import { type NextRequest, NextResponse } from "next/server"
import { haManager } from "@/lib/infrastructure/ha-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, region, zone, endpoint, version, metadata } = body

    const instance = await haManager.registerService({
      service,
      region,
      zone,
      endpoint,
      status: "healthy",
      version,
      metadata: metadata || {},
      loadMetrics: {
        cpu: 0,
        memory: 0,
        connections: 0,
        responseTime: 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: instance,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INSTANCE_REGISTRATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const service = url.searchParams.get("service")
    const region = url.searchParams.get("region")

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_SERVICE",
            message: "Service parameter is required",
          },
        },
        { status: 400 },
      )
    }

    const instances = await haManager.getHealthyInstances(service, region || undefined)

    return NextResponse.json({
      success: true,
      data: instances,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INSTANCES_FETCH_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
