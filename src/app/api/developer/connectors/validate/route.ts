import type { NextRequest } from "next/server"
import { connectorFramework } from "@/lib/developer/connector-framework"
import { errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { connector, testData } = body

    if (!connector) {
      return errorResponse("Connector configuration is required", "validation_error", 400)
    }

    // Validate connector
    const validationResult = await connectorFramework.validateConnector(connector, testData)

    return Response.json({
      success: true,
      data: validationResult,
      message: "Connector validation completed",
    })
  } catch (error) {
    console.error("Connector validation error:", error)
    return errorResponse("Failed to validate connector", "validation_error", 500)
  }
}
