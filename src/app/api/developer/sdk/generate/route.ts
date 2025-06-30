import type { NextRequest } from "next/server"
import { sdkGenerator } from "@/lib/developer/sdk-generator"
import { errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { language, config, endpoints, tenantId } = body

    if (!language || !config || !endpoints) {
      return errorResponse("Missing required fields: language, config, endpoints", "validation_error", 400)
    }

    // Generate SDK
    const result = await sdkGenerator.generateSDK(
      {
        language,
        version: config.version || "1.0.0",
        features: config.features || [],
        packageName: config.packageName || "tsmarthub-sdk",
        baseUrl: config.baseUrl || "https://api.tsmarthub.com",
        authentication: config.authentication || "api_key",
        includeTests: config.includeTests || false,
        includeExamples: config.includeExamples || false,
        includeDocs: config.includeDocs || false,
      },
      endpoints,
      tenantId,
    )

    return Response.json({
      success: true,
      data: result,
      message: "SDK generated successfully",
    })
  } catch (error) {
    console.error("SDK generation error:", error)
    return errorResponse("Failed to generate SDK", "generation_error", 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language")

    if (!language) {
      return errorResponse("Language parameter is required", "validation_error", 400)
    }

    // Get SDK template for language
    const template = await sdkGenerator.getTemplate(language)

    return Response.json({
      success: true,
      data: template,
      message: "SDK template retrieved successfully",
    })
  } catch (error) {
    console.error("SDK template error:", error)
    return errorResponse("Failed to get SDK template", "template_error", 500)
  }
}
