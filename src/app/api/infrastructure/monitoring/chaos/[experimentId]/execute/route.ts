import { type NextRequest, NextResponse } from "next/server"
import { infrastructureMonitor } from "@/lib/infrastructure/infrastructure-monitor"

export async function POST(request: NextRequest, { params }: { params: { experimentId: string } }) {
  try {
    const { experimentId } = params

    const result = await infrastructureMonitor.executeChaosExperiment(experimentId)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CHAOS_EXPERIMENT_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
