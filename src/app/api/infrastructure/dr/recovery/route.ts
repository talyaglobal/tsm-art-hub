import { type NextRequest, NextResponse } from "next/server"
import { drManager } from "@/lib/infrastructure/disaster-recovery"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, rto, rpo, priority, steps, dependencies, validationChecks } = body

    const plan = await drManager.createRecoveryPlan({
      name,
      description,
      rto,
      rpo,
      priority,
      steps,
      dependencies: dependencies || [],
      validationChecks: validationChecks || [],
    })

    return NextResponse.json({
      success: true,
      data: plan,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RECOVERY_PLAN_CREATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
