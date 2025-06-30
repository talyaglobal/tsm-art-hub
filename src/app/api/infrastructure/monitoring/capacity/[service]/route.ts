import { type NextRequest, NextResponse } from "next/server"
import { infrastructureMonitor } from "@/lib/infrastructure/infrastructure-monitor"

export async function GET(request: NextRequest, { params }: { params: { service: string } }) {
  try {
    const { service } = params
    const url = new URL(request.url)
    const region = url.searchParams.get("region") || "us-east-1"

    const plan = await infrastructureMonitor.generateCapacityPlan(service, region)

    return NextResponse.json({
      success: true,
      data: plan,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CAPACITY_PLAN_GENERATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
