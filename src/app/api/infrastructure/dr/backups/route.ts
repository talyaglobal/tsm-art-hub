import { type NextRequest, NextResponse } from "next/server"
import { drManager } from "@/lib/infrastructure/disaster-recovery"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, schedule, retention, targets, encryption, compression } = body

    const config = await drManager.createBackupConfig({
      name,
      type,
      schedule,
      retention,
      targets,
      encryption: encryption || { enabled: false },
      compression: compression || { enabled: false },
    })

    return NextResponse.json({
      success: true,
      data: config,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKUP_CONFIG_CREATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const status = await drManager.getBackupStatus()

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKUP_STATUS_FETCH_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
