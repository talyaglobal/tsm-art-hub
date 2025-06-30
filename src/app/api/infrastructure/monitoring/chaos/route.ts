import { type NextRequest, NextResponse } from "next/server"
import { infrastructureMonitor } from "@/lib/infrastructure/infrastructure-monitor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, target, parameters, duration, schedule } = body

    const experiment = await infrastructureMonitor.createChaosExperiment({
      name,
      description,
      type,
      target,
      parameters: parameters || {},
      duration,
      schedule,
    })

    return NextResponse.json({
      success: true,
      data: experiment,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CHAOS_EXPERIMENT_CREATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
