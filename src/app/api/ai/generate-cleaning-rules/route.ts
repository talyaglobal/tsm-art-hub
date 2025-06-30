import { type NextRequest, NextResponse } from "next/server"
import { DataCleaningService } from "@/lib/ai/data-cleaning"

const cleaningService = new DataCleaningService()

export async function POST(request: NextRequest) {
  try {
    const { data, schema, options = {} } = await request.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data array is required" }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({
        rules: [],
        qualityMetrics: cleaningService["getEmptyMetrics"](),
        message: "No data provided for analysis",
      })
    }

    // Analyze data quality
    const qualityMetrics = await cleaningService.analyzeDataQuality(data)

    // Generate cleaning rules
    const rules = await cleaningService.generateCleaningRules(data, schema)

    // Filter rules based on options
    let filteredRules = rules
    if (options.minConfidence) {
      filteredRules = rules.filter((rule) => rule.confidence >= options.minConfidence)
    }

    if (options.maxRules) {
      filteredRules = filteredRules.slice(0, options.maxRules)
    }

    if (options.ruleTypes) {
      filteredRules = filteredRules.filter((rule) => options.ruleTypes.includes(rule.ruleType))
    }

    // Calculate potential impact
    const totalImpact = filteredRules.reduce((sum, rule) => sum + rule.estimatedImpact, 0)
    const impactPercentage = data.length > 0 ? (totalImpact / data.length) * 100 : 0

    // Generate rule categories
    const rulesByCategory = filteredRules.reduce(
      (categories, rule) => {
        if (!categories[rule.ruleType]) categories[rule.ruleType] = []
        categories[rule.ruleType].push(rule)
        return categories
      },
      {} as Record<string, any[]>,
    )

    // Generate field-specific insights
    const fieldInsights = generateFieldInsights(data, filteredRules)

    // Create execution plan
    const executionPlan = createExecutionPlan(filteredRules)

    const response = {
      rules: filteredRules,
      qualityMetrics,
      rulesByCategory,
      fieldInsights,
      executionPlan,
      statistics: {
        totalRules: filteredRules.length,
        totalRecords: data.length,
        estimatedImpact: totalImpact,
        impactPercentage: Math.round(impactPercentage * 100) / 100,
        qualityImprovement: estimateQualityImprovement(qualityMetrics, filteredRules),
      },
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Cleaning rules generation error:", error)
    return NextResponse.json({ error: "Failed to generate cleaning rules" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data, rules } = await request.json()

    if (!data || !Array.isArray(data) || !rules || !Array.isArray(rules)) {
      return NextResponse.json({ error: "Data array and rules array are required" }, { status: 400 })
    }

    // Apply cleaning rules to data
    const cleanedData = await cleaningService.applyCleaningRules(data, rules)

    // Analyze quality improvement
    const originalQuality = await cleaningService.analyzeDataQuality(data)
    const cleanedQuality = await cleaningService.analyzeDataQuality(cleanedData)

    const improvement = {
      completeness: cleanedQuality.completeness - originalQuality.completeness,
      accuracy: cleanedQuality.accuracy - originalQuality.accuracy,
      consistency: cleanedQuality.consistency - originalQuality.consistency,
      validity: cleanedQuality.validity - originalQuality.validity,
      uniqueness: cleanedQuality.uniqueness - originalQuality.uniqueness,
      timeliness: cleanedQuality.timeliness - originalQuality.timeliness,
      overall: cleanedQuality.overallScore - originalQuality.overallScore,
    }

    // Generate cleaning report
    const report = generateCleaningReport(data, cleanedData, rules, improvement)

    const response = {
      originalData: data,
      cleanedData,
      originalQuality,
      cleanedQuality,
      improvement,
      report,
      appliedRules: rules,
      cleanedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Data cleaning error:", error)
    return NextResponse.json({ error: "Failed to clean data" }, { status: 500 })
  }
}

function generateFieldInsights(data: any[], rules: any[]): any[] {
  const fields = Object.keys(data[0] || {})

  return fields.map((field) => {
    const fieldRules = rules.filter((rule) => rule.field === field)
    const fieldData = data.map((item) => item[field]).filter((val) => val !== undefined && val !== null)

    const nullCount = data.length - fieldData.length
    const uniqueValues = new Set(fieldData).size
    const duplicateCount = fieldData.length - uniqueValues

    return {
      field,
      totalValues: data.length,
      nonNullValues: fieldData.length,
      nullCount,
      uniqueValues,
      duplicateCount,
      completeness: fieldData.length / data.length,
      uniqueness: uniqueValues / fieldData.length,
      applicableRules: fieldRules.length,
      topIssues: fieldRules
        .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
        .slice(0, 3)
        .map((rule) => ({
          type: rule.ruleType,
          description: rule.description,
          impact: rule.estimatedImpact,
        })),
    }
  })
}

function createExecutionPlan(rules: any[]): any {
  // Group rules by execution order
  const executionOrder = ["remove_duplicates", "fill_missing", "standardize_format", "validate_range", "custom"]

  const planSteps = executionOrder
    .map((ruleType) => {
      const typeRules = rules.filter((rule) => rule.ruleType === ruleType)
      if (typeRules.length === 0) return null

      return {
        step: executionOrder.indexOf(ruleType) + 1,
        ruleType,
        description: getRuleTypeDescription(ruleType),
        rules: typeRules.length,
        estimatedTime: estimateExecutionTime(typeRules),
        canParallelize: ruleType !== "remove_duplicates", // Duplicates must be sequential
      }
    })
    .filter(Boolean)

  return {
    steps: planSteps,
    totalSteps: planSteps.length,
    estimatedTotalTime: planSteps.reduce((sum, step) => sum + step.estimatedTime, 0),
    canParallelize: planSteps.some((step) => step.canParallelize),
  }
}

function getRuleTypeDescription(ruleType: string): string {
  const descriptions = {
    remove_duplicates: "Remove duplicate records and values",
    fill_missing: "Fill missing values with appropriate defaults",
    standardize_format: "Standardize data formats and casing",
    validate_range: "Validate numeric ranges and constraints",
    custom: "Apply custom transformation rules",
  }
  return descriptions[ruleType] || "Apply data cleaning rules"
}

function estimateExecutionTime(rules: any[]): number {
  // Estimate execution time in seconds based on rule complexity
  const timeEstimates = {
    remove_duplicates: 2,
    fill_missing: 1,
    standardize_format: 1.5,
    validate_range: 1,
    custom: 3,
  }

  return rules.reduce((total, rule) => {
    return total + (timeEstimates[rule.ruleType] || 1)
  }, 0)
}

function estimateQualityImprovement(currentQuality: any, rules: any[]): any {
  // Estimate quality improvement based on rules
  const improvements = {
    completeness: 0,
    accuracy: 0,
    consistency: 0,
    validity: 0,
    uniqueness: 0,
    timeliness: 0,
  }

  rules.forEach((rule) => {
    const impact = rule.confidence * 0.1 // Max 10% improvement per rule

    switch (rule.ruleType) {
      case "fill_missing":
        improvements.completeness += impact
        break
      case "standardize_format":
        improvements.consistency += impact
        improvements.validity += impact
        break
      case "remove_duplicates":
        improvements.uniqueness += impact
        break
      case "validate_range":
        improvements.accuracy += impact
        improvements.validity += impact
        break
    }
  })

  // Calculate projected scores
  const projected = {
    completeness: Math.min(1, currentQuality.completeness + improvements.completeness),
    accuracy: Math.min(1, currentQuality.accuracy + improvements.accuracy),
    consistency: Math.min(1, currentQuality.consistency + improvements.consistency),
    validity: Math.min(1, currentQuality.validity + improvements.validity),
    uniqueness: Math.min(1, currentQuality.uniqueness + improvements.uniqueness),
    timeliness: currentQuality.timeliness, // Timeliness doesn't improve with cleaning
  }

  projected["overall"] = Object.values(projected).reduce((sum: number, val: number) => sum + val, 0) / 6

  return {
    current: currentQuality,
    projected,
    improvements,
  }
}

function generateCleaningReport(originalData: any[], cleanedData: any[], rules: any[], improvement: any): string {
  let report = `Data Cleaning Report\n`
  report += `Generated: ${new Date().toISOString()}\n\n`

  report += `Summary:\n`
  report += `- Original Records: ${originalData.length}\n`
  report += `- Cleaned Records: ${cleanedData.length}\n`
  report += `- Rules Applied: ${rules.length}\n`
  report += `- Overall Quality Improvement: ${(improvement.overall * 100).toFixed(2)}%\n\n`

  report += `Quality Improvements:\n`
  Object.entries(improvement).forEach(([metric, value]) => {
    if (metric !== "overall" && typeof value === "number") {
      const percentage = (value * 100).toFixed(2)
      report += `- ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${percentage > 0 ? "+" : ""}${percentage}%\n`
    }
  })

  report += `\nRules Applied:\n`
  rules.forEach((rule, index) => {
    report += `${index + 1}. ${rule.name}\n`
    report += `   Field: ${rule.field}\n`
    report += `   Impact: ${rule.estimatedImpact} records\n`
    report += `   Confidence: ${(rule.confidence * 100).toFixed(1)}%\n\n`
  })

  return report
}

export async function GET() {
  return NextResponse.json({
    message: "AI Data Cleaning Rules API",
    endpoints: {
      "POST /api/ai/generate-cleaning-rules": "Generate intelligent data cleaning rules",
      "PUT /api/ai/generate-cleaning-rules": "Apply cleaning rules to data",
    },
  })
}
