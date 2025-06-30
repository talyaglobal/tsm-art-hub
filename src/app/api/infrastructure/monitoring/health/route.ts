import { NextResponse } from "next/server"
import { infrastructureMonitor } from "@/lib/infrastructure/infrastructure-monitor"

export async function GET() {
  try {
    const health = await infrastructureMonitor.getInfrastructureHealth()

    return NextResponse.json({
      success: true,
      data: health,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INFRASTRUCTURE_HEALTH_FETCH_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
