import type { NextRequest } from "next/server"
import { documentationGenerator } from "@/lib/developer/documentation-generator"
import { errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apis, format, config, tenantId } = body

    if (!apis || !Array.isArray(apis)) {
      return errorResponse("APIs array is required", "validation_error", 400)
    }

    // Generate documentation based on format
    let result
    switch (format) {
      case "html":
        result = await documentationGenerator.generateInteractiveHTML(apis, config)
        break
      case "openapi":
        result = await documentationGenerator.generateOpenAPISpec(apis, config)
        break
      case "markdown":
        result = await documentationGenerator.generateMarkdownDocumentation(apis, config)
        break
      default:
        return errorResponse("Invalid format specified", "validation_error", 400)
    }

    // Save documentation if tenantId provided
    if (tenantId) {
      const docId = await documentationGenerator.saveDocumentation(tenantId, format, result.content)
      result.id = docId
    }

    return Response.json({
      success: true,
      data: result,
      message: "Documentation generated successfully",
    })
  } catch (error) {
    console.error("Documentation generation error:", error)
    return errorResponse("Failed to generate documentation", "generation_error", 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiId = searchParams.get("apiId")
    const format = searchParams.get("format") || "openapi"

    if (!apiId) {
      return errorResponse("API ID is required", "validation_error", 400)
    }

    // Get API documentation
    const documentation = await documentationGenerator.getDocumentation(apiId, format)

    return Response.json({
      success: true,
      data: documentation,
      message: "Documentation retrieved successfully",
    })
  } catch (error) {
    console.error("Documentation retrieval error:", error)
    return errorResponse("Failed to retrieve documentation", "retrieval_error", 500)
  }
}
