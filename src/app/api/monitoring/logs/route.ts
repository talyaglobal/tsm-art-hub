import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logging/structured-logger"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const level = url.searchParams.getAll("level")
    const service = url.searchParams.getAll("service")
    const traceId = url.searchParams.get("traceId")
    const userId = url.searchParams.get("userId")
    const tenantId = url.searchParams.get("tenantId")
    const startTime = url.searchParams.get("startTime")
    const endTime = url.searchParams.get("endTime")
    const tags = url.searchParams.getAll("tags")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    const logs = await logger.query({
      level: level.length > 0 ? (level as any[]) : undefined,
      service: service.length > 0 ? service : undefined,
      traceId: traceId || undefined,
      userId: userId || undefined,
      tenantId: tenantId || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      tags: tags.length > 0 ? tags : undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          limit,
          offset,
          total: logs.length,
        },
      },
    })
  } catch (error) {
    console.error("Logs API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGS_QUERY_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { level, message, service, metadata, tags, context } = await request.json()

    if (!level || !message || !service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Level, message, and service are required",
          },
        },
        { status: 400 },
      )
    }

    const contextualLogger = context ? logger.withContext(context) : logger

    switch (level) {
      case "debug":
        await contextualLogger.debug(message, metadata, tags)
        break
      case "info":
        await contextualLogger.info(message, metadata, tags)
        break
      case "warn":
        await contextualLogger.warn(message, metadata, tags)
        break
      case "error":
        await contextualLogger.error(message, undefined, metadata, tags)
        break
      case "fatal":
        await contextualLogger.fatal(message, undefined, metadata, tags)
        break
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_LOG_LEVEL",
              message: "Invalid log level",
            },
          },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: true,
      message: "Log entry created successfully",
    })
  } catch (error) {
    console.error("Log creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOG_CREATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
