import { type NextRequest, NextResponse } from "next/server"
import { haManager } from "@/lib/infrastructure/ha-manager"

export async function DELETE(request: NextRequest, { params }: { params: { instanceId: string } }) {
  try {
    const { instanceId } = params

    await haManager.deregisterService(instanceId)

    return NextResponse.json({
      success: true,
      message: "Instance deregistered successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INSTANCE_DEREGISTRATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
