import { type NextRequest, NextResponse } from "next/server"
import { drManager } from "@/lib/infrastructure/disaster-recovery"

export async function POST(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const { planId } = params
    const body = await request.json()
    const { disasterEventId } = body

    const execution = await drManager.executeRecoveryPlan(planId, disasterEventId)

    return NextResponse.json({
      success: true,
      data: execution,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RECOVERY_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
