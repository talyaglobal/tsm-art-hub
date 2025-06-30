import { type NextRequest, NextResponse } from "next/server"
import { drManager } from "@/lib/infrastructure/disaster-recovery"

export async function POST(request: NextRequest, { params }: { params: { configId: string } }) {
  try {
    const { configId } = params
    const body = await request.json()
    const { manual = true } = body

    const job = await drManager.executeBackup(configId, manual)

    return NextResponse.json({
      success: true,
      data: job,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKUP_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
