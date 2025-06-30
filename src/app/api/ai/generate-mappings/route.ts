import type { NextRequest } from "next/server"
import { IntelligentMappingService } from "@/lib/ai/intelligent-mapping"

const mappingService = new IntelligentMappingService()

export async function POST(request: NextRequest) {
  try {
    const { sourceSchema, targetSchema, sampleData } = await request.json()

    if (!sourceSchema || !targetSchema) {
      return NextResponse.json({ error: "Both source and target schemas are required" }, { status: 400 })
    }

    // Generate intelligent field mappings
    const suggestions = await mappingService.generateMappings(sourceSchema, targetSchema)

    // Convert suggestions to field mappings
    const mappings = suggestions.map((suggestion, index) => ({
      id: `mapping_${index}`,
      sourceField: suggestion.sourceField,
      targetField: suggestion.targetField,
      transformation: suggestion.transformation,
      confidence: suggestion.confidence,
      mappingType: suggestion.transformation ? "transformed" : "direct",
      validationRules: [],
    }))

    // Add validation rules if sample data is provided
    if (sampleData && Array.isArray(sampleData)) {
      for (const mapping of mappings) {
        const rules = await mappingService.validateMapping(mapping, sampleData)
        mapping.validationRules = rules
      }
    }

    // Optimize mappings
    const optimizedMappings = await mappingService.optimizeMappings(mappings)

    // Calculate overall mapping confidence
    const overallConfidence =
      optimizedMappings.length > 0
        ? optimizedMappings.reduce((sum, m) => sum + m.confidence, 0) / optimizedMappings.length
        : 0

    // Generate mapping statistics
    const stats = {
      totalSourceFields: Object.keys(sourceSchema).length,
      totalTargetFields: Object.keys(targetSchema).length,
      mappedFields: optimizedMappings.length,
      unmappedSourceFields: Object.keys(sourceSchema).filter(
        (field) => !optimizedMappings.some((m) => m.sourceField === field),
      ),
      unmappedTargetFields: Object.keys(targetSchema).filter(
        (field) => !optimizedMappings.some((m) => m.targetField === field),
      ),
      averageConfidence: overallConfidence,
      directMappings: optimizedMappings.filter((m) => m.mappingType === "direct").length,
      transformedMappings: optimizedMappings.filter((m) => m.mappingType === "transformed").length,
    }

    const response = {
      mappings: optimizedMappings,
      suggestions: suggestions.slice(0, 20), // Top 20 suggestions
      statistics: stats,
      generatedAt: new Date().toISOString(),
      confidence: overallConfidence,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Mapping generation error:", error)
    return NextResponse.json({ error: "Failed to generate mappings" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Mapping Generation API",
    endpoints: {
      "POST /api/ai/generate-mappings": "Generate intelligent field mappings between schemas",
    },
  })
}
