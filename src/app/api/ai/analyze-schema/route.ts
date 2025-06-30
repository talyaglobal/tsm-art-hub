import type { NextRequest } from "next/server"
import { IntelligentMappingService } from "@/lib/ai/intelligent-mapping"
import { DataCleaningService } from "@/lib/ai/data-cleaning"

const mappingService = new IntelligentMappingService()
const cleaningService = new DataCleaningService()

export async function POST(request: NextRequest) {
  try {
    const { schema, sampleData } = await request.json()

    if (!schema) {
      return NextResponse.json({ error: "Schema is required" }, { status: 400 })
    }

    // Analyze schema structure
    const fields = Object.keys(schema)
    const dataTypes = fields.map((field) => ({
      field,
      type: schema[field].type || "unknown",
      nullable: schema[field].nullable || false,
      constraints: schema[field].constraints || [],
    }))

    // Generate suggestions for schema improvements
    const suggestions = []

    // Check for missing indexes
    const potentialIndexFields = fields.filter(
      (field) =>
        field.toLowerCase().includes("id") ||
        field.toLowerCase().includes("email") ||
        field.toLowerCase().includes("date"),
    )

    potentialIndexFields.forEach((field) => {
      if (!schema[field].indexed) {
        suggestions.push({
          type: "indexing",
          field,
          message: `Consider adding an index to ${field} for better query performance`,
          impact: "medium",
          autoFixable: true,
        })
      }
    })

    // Check for data quality if sample data is provided
    let qualityMetrics = null
    let cleaningRules = []

    if (sampleData && Array.isArray(sampleData) && sampleData.length > 0) {
      qualityMetrics = await cleaningService.analyzeDataQuality(sampleData)
      cleaningRules = await cleaningService.generateCleaningRules(sampleData, schema)

      // Add quality-based suggestions
      if (qualityMetrics.completeness < 0.9) {
        suggestions.push({
          type: "validation",
          field: "all",
          message: `Data completeness is ${(qualityMetrics.completeness * 100).toFixed(1)}%. Consider adding NOT NULL constraints`,
          impact: "high",
          autoFixable: false,
        })
      }

      if (qualityMetrics.consistency < 0.8) {
        suggestions.push({
          type: "normalization",
          field: "all",
          message: `Data consistency is ${(qualityMetrics.consistency * 100).toFixed(1)}%. Consider normalizing data formats`,
          impact: "medium",
          autoFixable: true,
        })
      }
    }

    // Detect relationships
    const relationships = []
    fields.forEach((field) => {
      if (field.toLowerCase().endsWith("_id") || field.toLowerCase().includes("ref")) {
        const referencedTable = field.replace(/_id$/, "").replace(/ref_/, "")
        relationships.push({
          sourceField: field,
          targetTable: referencedTable,
          type: "foreign_key",
          confidence: 0.8,
        })
      }
    })

    const analysis = {
      id: `analysis_${Date.now()}`,
      schema,
      suggestions: suggestions.sort((a, b) => {
        const impactWeight = { high: 3, medium: 2, low: 1 }
        return impactWeight[b.impact] - impactWeight[a.impact]
      }),
      qualityScore: qualityMetrics?.overallScore || 0.8,
      analyzedAt: new Date().toISOString(),
      dataTypes,
      relationships,
      qualityMetrics,
      cleaningRules: cleaningRules.slice(0, 10), // Top 10 rules
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Schema analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze schema" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Schema Analysis API",
    endpoints: {
      "POST /api/ai/analyze-schema": "Analyze data schema and provide optimization suggestions",
    },
  })
}
