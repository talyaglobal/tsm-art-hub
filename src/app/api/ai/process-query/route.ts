import { type NextRequest, NextResponse } from "next/server"
import { NaturalLanguageProcessor } from "@/lib/ai/natural-language-processor"

const nlpProcessor = new NaturalLanguageProcessor()

export async function POST(request: NextRequest) {
  try {
    const { query, context } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
    }

    // Process the natural language query
    const nlpResult = await nlpProcessor.processQuery(query)

    // Generate additional context-aware suggestions
    const contextualSuggestions = generateContextualSuggestions(nlpResult, context)

    // Generate code snippets if applicable
    const codeSnippets = await generateCodeSnippets(nlpResult)

    // Create step-by-step instructions
    const instructions = generateInstructions(nlpResult)

    const response = {
      query,
      nlpResult,
      contextualSuggestions,
      codeSnippets,
      instructions,
      processedAt: new Date().toISOString(),
      confidence: nlpResult.confidence,
      canAutoExecute: nlpResult.confidence > 0.8 && nlpResult.suggestedActions.length > 0,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("NLP processing error:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}

function generateContextualSuggestions(nlpResult: any, context: any): string[] {
  const suggestions: string[] = []

  // Add suggestions based on intent
  switch (nlpResult.intent) {
    case "create_integration":
      suggestions.push("Use the visual integration builder for complex workflows")
      suggestions.push("Test with sample data before going live")
      suggestions.push("Set up monitoring and alerts for the new integration")
      break

    case "analyze_data":
      suggestions.push("Export results to CSV for further analysis")
      suggestions.push("Set up automated reports for regular monitoring")
      suggestions.push("Compare with historical data for trends")
      break

    case "generate_report":
      suggestions.push("Save report template for future use")
      suggestions.push("Schedule automatic report generation")
      suggestions.push("Share report with team members")
      break

    case "troubleshoot":
      suggestions.push("Check system logs for detailed error information")
      suggestions.push("Verify API credentials and permissions")
      suggestions.push("Test with reduced data volume first")
      break
  }

  // Add context-specific suggestions
  if (context?.currentPage === "integrations") {
    suggestions.push("View integration health dashboard")
    suggestions.push("Check recent sync logs")
  }

  if (context?.userRole === "admin") {
    suggestions.push("Review user permissions and access levels")
    suggestions.push("Check system resource usage")
  }

  return suggestions
}

async function generateCodeSnippets(nlpResult: any): Promise<any[]> {
  const snippets: any[] = []

  if (nlpResult.intent === "create_integration") {
    const source = nlpResult.entities.find((e: any) => e.type === "source")?.value
    const destination = nlpResult.entities.find((e: any) => e.type === "destination")?.value

    if (source && destination) {
      snippets.push({
        language: "javascript",
        title: "Integration Configuration",
        code: `const integrationConfig = {
  name: "${source} to ${destination} Integration",
  source: {
    type: "${source}",
    config: {
      apiKey: process.env.${source.toUpperCase()}_API_KEY,
      endpoint: "/${source.toLowerCase()}/api/v1"
    }
  },
  destination: {
    type: "${destination}",
    config: {
      apiKey: process.env.${destination.toUpperCase()}_API_KEY,
      endpoint: "/${destination.toLowerCase()}/api/v1"
    }
  },
  schedule: "*/15 * * * *", // Every 15 minutes
  mappings: [
    { source: "id", destination: "external_id" },
    { source: "email", destination: "email_address" },
    { source: "name", destination: "full_name" }
  ]
}`,
      })

      snippets.push({
        language: "curl",
        title: "API Test Command",
        code: `curl -X POST "https://api.tsmarthub.com/integrations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ source, destination }, null, 2)}'`,
      })
    }
  }

  if (nlpResult.intent === "analyze_data") {
    snippets.push({
      language: "javascript",
      title: "Data Quality Check",
      code: `const qualityCheck = await fetch('/api/ai/analyze-schema', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schema: yourSchema,
    sampleData: yourSampleData
  })
})

const analysis = await qualityCheck.json()
console.log('Quality Score:', analysis.qualityScore)
console.log('Suggestions:', analysis.suggestions)`,
    })
  }

  return snippets
}

function generateInstructions(nlpResult: any): string[] {
  const instructions: string[] = []

  switch (nlpResult.intent) {
    case "create_integration":
      instructions.push("1. Navigate to the Integrations page")
      instructions.push('2. Click "Create New Integration"')
      instructions.push("3. Select your source and destination systems")
      instructions.push("4. Configure authentication credentials")
      instructions.push("5. Map fields between systems")
      instructions.push("6. Set up sync schedule")
      instructions.push("7. Test with sample data")
      instructions.push("8. Enable the integration")
      break

    case "analyze_data":
      instructions.push("1. Go to the Analytics dashboard")
      instructions.push("2. Select the data source to analyze")
      instructions.push("3. Choose analysis type (quality, patterns, etc.)")
      instructions.push("4. Review the generated insights")
      instructions.push("5. Export results if needed")
      break

    case "generate_report":
      instructions.push("1. Open the Reports section")
      instructions.push('2. Click "Create New Report"')
      instructions.push("3. Select data sources and metrics")
      instructions.push("4. Choose visualization type")
      instructions.push("5. Configure filters and parameters")
      instructions.push("6. Preview and generate report")
      instructions.push("7. Save or schedule for regular generation")
      break

    case "troubleshoot":
      instructions.push("1. Check the System Health dashboard")
      instructions.push("2. Review recent error logs")
      instructions.push("3. Identify the failing component")
      instructions.push("4. Check configuration and credentials")
      instructions.push("5. Test with minimal data set")
      instructions.push("6. Apply recommended fixes")
      instructions.push("7. Monitor for resolution")
      break
  }

  return instructions
}

export async function GET() {
  return NextResponse.json({
    message: "AI Natural Language Processing API",
    endpoints: {
      "POST /api/ai/process-query": "Process natural language queries and generate actionable insights",
    },
    examples: [
      "Create an integration from Shopify to QuickBooks",
      "Analyze data quality for customer records",
      "Generate a report showing API usage trends",
      "Why is my Stripe integration failing?",
    ],
  })
}
