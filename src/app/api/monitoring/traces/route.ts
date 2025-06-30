import { type NextRequest, NextResponse } from "next/server"
import { tracer } from "@/lib/tracing/distributed-tracer"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const traceId = url.searchParams.get("traceId")
    const service = url.searchParams.get("service")
    const operationName = url.searchParams.get("operationName")
    const userId = url.searchParams.get("userId")
    const tenantId = url.searchParams.get("tenantId")
    const startTime = url.searchParams.get("startTime")
    const endTime = url.searchParams.get("endTime")
    const minDuration = url.searchParams.get("minDuration")
    const maxDuration = url.searchParams.get("maxDuration")
    const status = url.searchParams.getAll("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    if (traceId) {
      // Get specific trace
      const spans = await tracer.getTrace(traceId)
      return NextResponse.json({
        success: true,
        data: {
          traceId,
          spans,
        },
      })
    } else {
      // Search traces
      const traces = await tracer.searchTraces({
        service: service || undefined,
        operationName: operationName || undefined,
        userId: userId || undefined,
        tenantId: tenantId || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        minDuration: minDuration ? Number.parseInt(minDuration) : undefined,
        maxDuration: maxDuration ? Number.parseInt(maxDuration) : undefined,
        status: status.length > 0 ? status : undefined,
        limit,
      })

      return NextResponse.json({
        success: true,
        data: traces,
      })
    }
  } catch (error) {
    console.error("Traces API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TRACES_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
