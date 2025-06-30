interface AggregationRule {
  id: string
  name: string
  sourceFields: string[]
  targetField: string
  operation: "sum" | "avg" | "count" | "min" | "max" | "concat" | "first" | "last"
  groupBy?: string[]
  filter?: string
  enabled: boolean
}

interface EnrichmentRule {
  id: string
  name: string
  sourceField: string
  targetField: string
  enrichmentType: "lookup" | "calculation" | "transformation" | "external_api"
  parameters: Record<string, any>
  enabled: boolean
}

interface ProcessingResult {
  originalCount: number
  processedCount: number
  aggregatedGroups?: number
  enrichedFields: string[]
  errors: string[]
  appliedRules: string[]
}

export class AggregationEnrichmentService {
  private aggregationRules: Map<string, AggregationRule> = new Map()
  private enrichmentRules: Map<string, EnrichmentRule> = new Map()
  private lookupTables: Map<string, Record<string, any>[]> = new Map()

  addAggregationRule(rule: AggregationRule): void {
    this.aggregationRules.set(rule.id, rule)
  }

  addEnrichmentRule(rule: EnrichmentRule): void {
    this.enrichmentRules.set(rule.id, rule)
  }

  addLookupTable(name: string, data: Record<string, any>[]): void {
    this.lookupTables.set(name, data)
  }

  async processData(
    data: Record<string, any>[],
    options: {
      aggregationRuleIds?: string[]
      enrichmentRuleIds?: string[]
      skipAggregation?: boolean
      skipEnrichment?: boolean
    } = {},
  ): Promise<{ data: Record<string, any>[]; result: ProcessingResult }> {
    let processedData = [...data]
    const result: ProcessingResult = {
      originalCount: data.length,
      processedCount: 0,
      enrichedFields: [],
      errors: [],
      appliedRules: [],
    }

    try {
      // Apply enrichment first
      if (!options.skipEnrichment) {
        const enrichmentResult = await this.applyEnrichment(processedData, options.enrichmentRuleIds)
        processedData = enrichmentResult.data
        result.enrichedFields = enrichmentResult.enrichedFields
        result.errors.push(...enrichmentResult.errors)
        result.appliedRules.push(...enrichmentResult.appliedRules)
      }

      // Apply aggregation
      if (!options.skipAggregation) {
        const aggregationResult = await this.applyAggregation(processedData, options.aggregationRuleIds)
        processedData = aggregationResult.data
        result.aggregatedGroups = aggregationResult.groupCount
        result.errors.push(...aggregationResult.errors)
        result.appliedRules.push(...aggregationResult.appliedRules)
      }

      result.processedCount = processedData.length
      return { data: processedData, result }
    } catch (error) {
      result.errors.push(`Processing failed: ${error}`)
      return { data, result }
    }
  }

  private async applyEnrichment(
    data: Record<string, any>[],
    ruleIds?: string[],
  ): Promise<{
    data: Record<string, any>[]
    enrichedFields: string[]
    errors: string[]
    appliedRules: string[]
  }> {
    const rulesToApply = ruleIds
      ? Array.from(this.enrichmentRules.values()).filter((rule) => ruleIds.includes(rule.id))
      : Array.from(this.enrichmentRules.values()).filter((rule) => rule.enabled)

    let enrichedData = [...data]
    const enrichedFields: string[] = []
    const errors: string[] = []
    const appliedRules: string[] = []

    for (const rule of rulesToApply) {
      try {
        enrichedData = await this.applyEnrichmentRule(enrichedData, rule)
        enrichedFields.push(rule.targetField)
        appliedRules.push(rule.id)
      } catch (error) {
        errors.push(`Error applying enrichment rule ${rule.id}: ${error}`)
      }
    }

    return { data: enrichedData, enrichedFields, errors, appliedRules }
  }

  private async applyEnrichmentRule(data: Record<string, any>[], rule: EnrichmentRule): Promise<Record<string, any>[]> {
    const enrichedData = data.map((row) => ({ ...row }))

    switch (rule.enrichmentType) {
      case "lookup":
        return this.applyLookupEnrichment(enrichedData, rule)
      case "calculation":
        return this.applyCalculationEnrichment(enrichedData, rule)
      case "transformation":
        return this.applyTransformationEnrichment(enrichedData, rule)
      case "external_api":
        return await this.applyExternalApiEnrichment(enrichedData, rule)
      default:
        throw new Error(`Unknown enrichment type: ${rule.enrichmentType}`)
    }
  }

  private applyLookupEnrichment(data: Record<string, any>[], rule: EnrichmentRule): Record<string, any>[] {
    const lookupTable = this.lookupTables.get(rule.parameters.tableName)
    if (!lookupTable) {
      throw new Error(`Lookup table ${rule.parameters.tableName} not found`)
    }

    const lookupKey = rule.parameters.lookupKey
    const returnField = rule.parameters.returnField

    // Create lookup index for performance
    const lookupIndex = new Map<any, any>()
    for (const lookupRow of lookupTable) {
      lookupIndex.set(lookupRow[lookupKey], lookupRow[returnField])
    }

    return data.map((row) => {
      const lookupValue = row[rule.sourceField]
      const enrichedValue = lookupIndex.get(lookupValue)

      return {
        ...row,
        [rule.targetField]: enrichedValue || rule.parameters.defaultValue || null,
      }
    })
  }

  private applyCalculationEnrichment(data: Record<string, any>[], rule: EnrichmentRule): Record<string, any>[] {
    const formula = rule.parameters.formula
    const dependencies = rule.parameters.dependencies || []

    return data.map((row) => {
      try {
        const calculatedValue = this.evaluateFormula(formula, row, dependencies)
        return {
          ...row,
          [rule.targetField]: calculatedValue,
        }
      } catch (error) {
        return {
          ...row,
          [rule.targetField]: rule.parameters.defaultValue || null,
        }
      }
    })
  }

  private applyTransformationEnrichment(data: Record<string, any>[], rule: EnrichmentRule): Record<string, any>[] {
    const transformation = rule.parameters.transformation

    return data.map((row) => {
      const sourceValue = row[rule.sourceField]
      let transformedValue = sourceValue

      switch (transformation) {
        case "uppercase":
          transformedValue = String(sourceValue).toUpperCase()
          break
        case "lowercase":
          transformedValue = String(sourceValue).toLowerCase()
          break
        case "trim":
          transformedValue = String(sourceValue).trim()
          break
        case "extract_domain":
          if (typeof sourceValue === "string" && sourceValue.includes("@")) {
            transformedValue = sourceValue.split("@")[1]
          }
          break
        case "format_phone":
          transformedValue = String(sourceValue).replace(/[^\d]/g, "")
          break
        default:
          transformedValue = sourceValue
      }

      return {
        ...row,
        [rule.targetField]: transformedValue,
      }
    })
  }

  private async applyExternalApiEnrichment(
    data: Record<string, any>[],
    rule: EnrichmentRule,
  ): Promise<Record<string, any>[]> {
    const apiUrl = rule.parameters.apiUrl
    const apiKey = rule.parameters.apiKey
    const batchSize = rule.parameters.batchSize || 10

    const enrichedData = [...data]

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < enrichedData.length; i += batchSize) {
      const batch = enrichedData.slice(i, i + batchSize)

      for (const row of batch) {
        try {
          const sourceValue = row[rule.sourceField]
          const enrichedValue = await this.callExternalApi(apiUrl, sourceValue, apiKey)
          row[rule.targetField] = enrichedValue
        } catch (error) {
          row[rule.targetField] = rule.parameters.defaultValue || null
        }
      }

      // Add delay between batches
      if (i + batchSize < enrichedData.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return enrichedData
  }

  private async callExternalApi(url: string, value: any, apiKey?: string): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ value }),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.enrichedValue || result.value || null
  }

  private async applyAggregation(
    data: Record<string, any>[],
    ruleIds?: string[],
  ): Promise<{
    data: Record<string, any>[]
    groupCount: number
    errors: string[]
    appliedRules: string[]
  }> {
    const rulesToApply = ruleIds
      ? Array.from(this.aggregationRules.values()).filter((rule) => ruleIds.includes(rule.id))
      : Array.from(this.aggregationRules.values()).filter((rule) => rule.enabled)

    if (rulesToApply.length === 0) {
      return { data, groupCount: 0, errors: [], appliedRules: [] }
    }

    const errors: string[] = []
    const appliedRules: string[] = []
    let aggregatedData = data

    for (const rule of rulesToApply) {
      try {
        aggregatedData = this.applyAggregationRule(aggregatedData, rule)
        appliedRules.push(rule.id)
      } catch (error) {
        errors.push(`Error applying aggregation rule ${rule.id}: ${error}`)
      }
    }

    const groupCount = this.calculateGroupCount(aggregatedData, rulesToApply)

    return { data: aggregatedData, groupCount, errors, appliedRules }
  }

  private applyAggregationRule(data: Record<string, any>[], rule: AggregationRule): Record<string, any>[] {
    // Filter data if filter condition exists
    let filteredData = data
    if (rule.filter) {
      filteredData = data.filter((row) => this.evaluateFilter(row, rule.filter!))
    }

    // Group data
    const groups = this.groupData(filteredData, rule.groupBy || [])

    // Apply aggregation to each group
    const aggregatedData: Record<string, any>[] = []

    for (const [groupKey, groupData] of groups) {
      const aggregatedRow: Record<string, any> = {}

      // Add group by fields
      if (rule.groupBy) {
        const groupKeyParts = groupKey.split("|")
        rule.groupBy.forEach((field, index) => {
          aggregatedRow[field] = groupKeyParts[index]
        })
      }

      // Apply aggregation operation
      aggregatedRow[rule.targetField] = this.performAggregation(groupData, rule.sourceFields, rule.operation)

      aggregatedData.push(aggregatedRow)
    }

    return aggregatedData
  }

  private groupData(data: Record<string, any>[], groupByFields: string[]): Map<string, Record<string, any>[]> {
    const groups = new Map<string, Record<string, any>[]>()

    for (const row of data) {
      const groupKey = groupByFields.length > 0 ? groupByFields.map((field) => row[field] || "").join("|") : "all"

      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(row)
    }

    return groups
  }

  private performAggregation(
    data: Record<string, any>[],
    sourceFields: string[],
    operation: AggregationRule["operation"],
  ): any {
    if (data.length === 0) return null

    switch (operation) {
      case "count":
        return data.length

      case "sum":
        return sourceFields.reduce((total, field) => {
          const sum = data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0)
          return total + sum
        }, 0)

      case "avg":
        const sum = sourceFields.reduce((total, field) => {
          const fieldSum = data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0)
          return total + fieldSum
        }, 0)
        return sum / (sourceFields.length * data.length)

      case "min":
        return sourceFields.reduce((min, field) => {
          const fieldMin = Math.min(...data.map((row) => Number(row[field]) || Number.POSITIVE_INFINITY))
          return Math.min(min, fieldMin)
        }, Number.POSITIVE_INFINITY)

      case "max":
        return sourceFields.reduce((max, field) => {
          const fieldMax = Math.max(...data.map((row) => Number(row[field]) || Number.NEGATIVE_INFINITY))
          return Math.max(max, fieldMax)
        }, Number.NEGATIVE_INFINITY)

      case "concat":
        return sourceFields
          .map((field) =>
            data
              .map((row) => row[field])
              .filter((v) => v != null)
              .join(", "),
          )
          .join(" | ")

      case "first":
        return data[0][sourceFields[0]]

      case "last":
        return data[data.length - 1][sourceFields[0]]

      default:
        return null
    }
  }

  private evaluateFilter(row: Record<string, any>, filter: string): boolean {
    // Simple filter evaluation - in production, use a proper expression evaluator
    try {
      // Replace field names with actual values
      let expression = filter
      for (const [field, value] of Object.entries(row)) {
        const regex = new RegExp(`\\b${field}\\b`, "g")
        const safeValue = typeof value === "string" ? `"${value}"` : value
        expression = expression.replace(regex, String(safeValue))
      }

      // Basic safety check
      if (expression.includes("function") || expression.includes("eval")) {
        return false
      }

      return Boolean(eval(expression))
    } catch {
      return false
    }
  }

  private evaluateFormula(formula: string, row: Record<string, any>, dependencies: string[]): any {
    try {
      let expression = formula

      // Replace field references with actual values
      for (const dep of dependencies) {
        const value = row[dep]
        const regex = new RegExp(`\\b${dep}\\b`, "g")
        expression = expression.replace(regex, String(value || 0))
      }

      // Basic safety check
      if (expression.includes("function") || expression.includes("eval")) {
        throw new Error("Unsafe formula")
      }

      return eval(expression)
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${error}`)
    }
  }

  private calculateGroupCount(data: Record<string, any>[], rules: AggregationRule[]): number {
    // Simple estimation - in practice, this would be more sophisticated
    return data.length
  }

  getAggregationRules(): AggregationRule[] {
    return Array.from(this.aggregationRules.values())
  }

  getEnrichmentRules(): EnrichmentRule[] {
    return Array.from(this.enrichmentRules.values())
  }

  removeAggregationRule(ruleId: string): void {
    this.aggregationRules.delete(ruleId)
  }

  removeEnrichmentRule(ruleId: string): void {
    this.enrichmentRules.delete(ruleId)
  }
}

export const aggregationEnrichmentService = new AggregationEnrichmentService()
