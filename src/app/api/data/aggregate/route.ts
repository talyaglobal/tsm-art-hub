import { type NextRequest, NextResponse } from "next/server"
import { DataAggregationEnrichmentService } from "@/lib/data/aggregation-enrichment"
import { createClient } from "@/lib/supabase/server"

const aggregationService = new DataAggregationEnrichmentService()

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data, aggregationRules, enrichmentRules } = await request.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data array is required" }, { status: 400 })
    }

    let aggregationResult = null
    let enrichmentResult = null

    // Apply aggregation rules if provided
    if (aggregationRules && Array.isArray(aggregationRules) && aggregationRules.length > 0) {
      aggregationResult = await aggregationService.aggregateData(data, aggregationRules)
    }

    // Apply enrichment rules if provided
    if (enrichmentRules && Array.isArray(enrichmentRules) && enrichmentRules.length > 0) {
      enrichmentResult = await aggregationService.enrichData(data, enrichmentRules)
    }

    return NextResponse.json({
      success: true,
      aggregationResult,
      enrichmentResult,
      message: "Data processing completed",
    })
  } catch (error) {
    console.error("Data aggregation/enrichment error:", error)
    return NextResponse.json({ error: "Failed to process data" }, { status: 500 })
  }
}

export async function GET() {
  const supportedAggregations = aggregationService.getSupportedAggregations()
  const supportedEnrichmentSources = aggregationService.getSupportedEnrichmentSources()

  return NextResponse.json({
    supportedAggregations,
    supportedEnrichmentSources,
    message: "Data Aggregation and Enrichment API",
  })
}
