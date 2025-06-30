import type { NextRequest } from "next/server"
import { connectorFramework } from "@/lib/developer/connector-framework"
import { errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template, config, tenantId } = body

    if (!template || !config) {
      return errorResponse("Template and config are required", "validation_error", 400)
    }

    // Generate connector code
    const result = await connectorFramework.generateConnector(template, config, tenantId)

    return Response.json({
      success: true,
      data: result,
      message: "Connector generated successfully",
    })
  } catch (error) {
    console.error("Connector generation error:", error)
    return errorResponse("Failed to generate connector", "generation_error", 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Get available connector templates
    const templates = await connectorFramework.getTemplates(category)

    return Response.json({
      success: true,
      data: templates,
      message: "Connector templates retrieved successfully",
    })
  } catch (error) {
    console.error("Template retrieval error:", error)
    return errorResponse("Failed to retrieve templates", "retrieval_error", 500)
  }
}
