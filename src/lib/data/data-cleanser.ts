interface CleansingRule {
  id: string
  name: string
  field: string
  type: "remove_nulls" | "standardize_format" | "remove_duplicates" | "validate_type" | "transform_value"
  parameters: Record<string, any>
  enabled: boolean
}

interface CleansingResult {
  originalRowCount: number
  cleanedRowCount: number
  removedRows: number[]
  modifiedFields: Record<string, number>
  errors: Array<{
    row: number
    field: string
    error: string
    originalValue: any
  }>
  warnings: Array<{
    row: number
    field: string
    warning: string
    value: any
  }>
  statistics: {
    validationsPassed: number
    validationsFailed: number
    transformationsApplied: number
    duplicatesRemoved: number
  }
  originalCount: number
  cleanedCount: number
  removedCount: number
  modifiedCount: number
  appliedRules: string[]
}

interface DataProfile {
  field: string
  dataType: string
  nullCount: number
  uniqueCount: number
  minValue?: any
  maxValue?: any
  avgLength?: number
  commonValues: Array<{ value: any; count: number }>
  patterns: Array<{ pattern: string; count: number }>
  qualityScore: number
}

export class DataCleanser {
  private readonly defaultRules: CleansingRule[] = [
    {
      id: "remove_nulls",
      name: "Remove Null Values",
      field: "*",
      type: "remove_nulls",
      parameters: { criticalFields: [] },
      enabled: true,
    },
    {
      id: "trim_whitespace",
      name: "Trim Whitespace",
      field: "*",
      type: "standardize_format",
      parameters: { format: "trim" },
      enabled: true,
    },
    {
      id: "standardize_email",
      name: "Standardize Email",
      field: "*email*",
      type: "standardize_format",
      parameters: { format: "email" },
      enabled: true,
    },
  ]

  private rules: Map<string, CleansingRule> = new Map()

  constructor() {
    for (const rule of this.defaultRules) {
      this.rules.set(rule.id, rule)
    }
  }

  addRule(rule: CleansingRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  async cleanseData(
    data: Record<string, any>[],
    customRules: CleansingRule[] = [],
    ruleIds?: string[],
    options: {
      enableDefaultRules?: boolean
      preserveOriginal?: boolean
      maxErrors?: number
    } = {},
  ): Promise<CleansingResult> {
    const { enableDefaultRules = true, preserveOriginal = true, maxErrors = 1000 } = options

    if (!data || data.length === 0) {
      throw new Error("No data provided for cleansing")
    }

    // Combine rules and sort by priority
    const allRules = enableDefaultRules ? [...this.defaultRules, ...customRules] : customRules

    const enabledRules = allRules.filter((rule) => rule.enabled).sort((a, b) => a.priority - b.priority)

    // Initialize result
    const result: CleansingResult = {
      originalRowCount: data.length,
      cleanedRowCount: 0,
      removedRows: [],
      modifiedFields: {},
      errors: [],
      warnings: [],
      statistics: {
        validationsPassed: 0,
        validationsFailed: 0,
        transformationsApplied: 0,
        duplicatesRemoved: 0,
      },
      originalCount: data.length,
      cleanedCount: 0,
      removedCount: 0,
      modifiedCount: 0,
      appliedRules: [],
    }

    // Create working copy
    let workingData = preserveOriginal ? JSON.parse(JSON.stringify(data)) : data

    // Apply rules
    for (const rule of enabledRules) {
      try {
        const ruleResult = this.applyRule(workingData, rule)

        // Update working data
        workingData = ruleResult.data

        // Merge results
        result.removedRows.push(...ruleResult.removedRows)

        for (const [field, count] of Object.entries(ruleResult.modifiedFields)) {
          result.modifiedFields[field] = (result.modifiedFields[field] || 0) + count
        }

        result.errors.push(...ruleResult.errors)
        result.warnings.push(...ruleResult.warnings)

        // Update statistics
        result.statistics.validationsPassed += ruleResult.validationsPassed
        result.statistics.validationsFailed += ruleResult.validationsFailed
        result.statistics.transformationsApplied += ruleResult.transformationsApplied
        result.statistics.duplicatesRemoved += ruleResult.duplicatesRemoved

        // Stop if too many errors
        if (result.errors.length >= maxErrors) {
          result.warnings.push({
            row: -1,
            field: "system",
            warning: `Stopped processing due to too many errors (${maxErrors})`,
            value: null,
          })
          break
        }
      } catch (error) {
        result.errors.push({
          row: -1,
          field: rule.field,
          error: `Rule application failed: ${error}`,
          originalValue: null,
        })
      }
    }

    result.cleanedRowCount = workingData.length
    result.originalCount = data.length
    result.cleanedCount = workingData.length
    result.removedCount = result.removedRows.length
    result.modifiedCount = Object.values(result.modifiedFields).reduce((sum, count) => sum + count, 0)
    return result
  }

  async profileData(data: Record<string, any>[]): Promise<DataProfile[]> {
    if (!data || data.length === 0) {
      return []
    }

    const fields = Object.keys(data[0])
    const profiles: DataProfile[] = []

    for (const field of fields) {
      const profile = await this.profileField(field, data)
      profiles.push(profile)
    }

    return profiles
  }

  async generateCleansingRules(data: Record<string, any>[]): Promise<CleansingRule[]> {
    const profiles = await this.profileData(data)
    const generatedRules: CleansingRule[] = []

    for (const profile of profiles) {
      const rules = this.generateRulesForField(profile)
      generatedRules.push(...rules)
    }

    return generatedRules
  }

  private applyRule(
    data: Record<string, any>[],
    rule: CleansingRule,
  ): {
    data: Record<string, any>[]
    affectedCount: number
    removedRows: number[]
    modifiedFields: Record<string, number>
    errors: Array<{ row: number; field: string; error: string; originalValue: any }>
    warnings: Array<{ row: number; field: string; warning: string; value: any }>
    validationsPassed: number
    validationsFailed: number
    transformationsApplied: number
    duplicatesRemoved: number
  } {
    let affectedCount = 0
    const removedRows: number[] = []
    const modifiedFields: Record<string, number> = {}
    const errors: Array<{ row: number; field: string; error: string; originalValue: any }> = []
    const warnings: Array<{ row: number; field: string; warning: string; value: any }> = []
    let validationsPassed = 0
    const validationsFailed = 0
    const transformationsApplied = 0
    const duplicatesRemoved = 0

    switch (rule.type) {
      case "remove_nulls":
        const filteredData = data.filter((row) => {
          const value = row[rule.field]
          const shouldRemove = value === null || value === undefined || value === ""
          if (shouldRemove) {
            affectedCount++
            removedRows.push(data.indexOf(row))
          }
          return !shouldRemove
        })
        return {
          data: filteredData,
          affectedCount,
          removedRows,
          modifiedFields,
          errors,
          warnings,
          validationsPassed,
          validationsFailed,
          transformationsApplied,
          duplicatesRemoved,
        }

      case "remove_duplicates":
        const seen = new Set()
        const uniqueData = data.filter((row) => {
          const value = row[rule.field]
          const key = JSON.stringify(value)
          if (seen.has(key)) {
            affectedCount++
            removedRows.push(data.indexOf(row))
          }
          seen.add(key)
          return !seen.has(key)
        })
        return {
          data: uniqueData,
          affectedCount,
          removedRows,
          modifiedFields,
          errors,
          warnings,
          validationsPassed,
          validationsFailed,
          transformationsApplied,
          duplicatesRemoved,
        }

      case "standardize_format":
        const standardizedData = data.map((row) => {
          const value = row[rule.field]
          if (value !== null && value !== undefined) {
            row[rule.field] = this.standardizeValue(value, rule.parameters)
            affectedCount++
            modifiedFields[rule.field] = (modifiedFields[rule.field] || 0) + 1
          }
          return row
        })
        return {
          data: standardizedData,
          affectedCount,
          removedRows,
          modifiedFields,
          errors,
          warnings,
          validationsPassed,
          validationsFailed,
          transformationsApplied,
          duplicatesRemoved,
        }

      case "validate_type":
        const validatedData = data.filter((row) => {
          const value = row[rule.field]
          const isValid = this.validateType(value, rule.parameters.expectedType)
          if (!isValid) {
            affectedCount++
            errors.push({
              row: data.indexOf(row),
              field: rule.field,
              error: `Validation failed for field ${rule.field}`,
              originalValue: value,
            })
          } else {
            validationsPassed++
          }
          return isValid
        })
        return {
          data: validatedData,
          affectedCount,
          removedRows,
          modifiedFields,
          errors,
          warnings,
          validationsPassed,
          validationsFailed,
          transformationsApplied,
          duplicatesRemoved,
        }

      case "transform_value":
        const transformedData = data.map((row) => {
          const value = row[rule.field]
          if (value !== null && value !== undefined) {
            row[rule.field] = this.transformValue(value, rule.parameters)
            affectedCount++
            modifiedFields[rule.field] = (modifiedFields[rule.field] || 0) + 1
          }
          return row
        })
        return {
          data: transformedData,
          affectedCount,
          removedRows,
          modifiedFields,
          errors,
          warnings,
          validationsPassed,
          validationsFailed,
          transformationsApplied,
          duplicatesRemoved,
        }

      default:
        return {
          data,
          affectedCount,
          removedRows,
          modifiedFields,
          errors,
          warnings,
          validationsPassed,
          validationsFailed,
          transformationsApplied,
          duplicatesRemoved,
        }
    }
  }

  private standardizeValue(value: any, parameters: Record<string, any>): any {
    const format = parameters.format || "lowercase"
    const stringValue = String(value)

    switch (format) {
      case "lowercase":
        return stringValue.toLowerCase()
      case "uppercase":
        return stringValue.toUpperCase()
      case "trim":
        return stringValue.trim()
      case "phone":
        return stringValue.replace(/[^\d]/g, "")
      case "email":
        return stringValue.toLowerCase().trim()
      default:
        return value
    }
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case "string":
        return typeof value === "string"
      case "number":
        return typeof value === "number" && !isNaN(value)
      case "boolean":
        return typeof value === "boolean"
      case "email":
        return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case "phone":
        return typeof value === "string" && /^\+?[\d\s\-()]+$/.test(value)
      case "date":
        return !isNaN(Date.parse(value))
      default:
        return true
    }
  }

  private transformValue(value: any, parameters: Record<string, any>): any {
    const transformation = parameters.transformation

    switch (transformation) {
      case "to_number":
        return Number(value)
      case "to_string":
        return String(value)
      case "to_date":
        return new Date(value)
      case "multiply":
        return Number(value) * (parameters.factor || 1)
      case "divide":
        return Number(value) / (parameters.factor || 1)
      case "replace":
        return String(value).replace(new RegExp(parameters.pattern, "g"), parameters.replacement || "")
      default:
        return value
    }
  }

  getRules(): CleansingRule[] {
    return Array.from(this.rules.values())
  }

  getRule(ruleId: string): CleansingRule | undefined {
    return this.rules.get(ruleId)
  }

  private profileField(field: string, data: Record<string, any>[]): Promise<DataProfile> {
    const values = data.map((row) => row[field])
    const nonNullValues = values.filter((v) => v != null && v !== "")

    // Basic statistics
    const nullCount = values.length - nonNullValues.length
    const uniqueValues = new Set(nonNullValues)
    const uniqueCount = uniqueValues.size

    // Data type detection
    const dataType = this.detectDataType(nonNullValues)

    // Min/Max values
    let minValue: any
    let maxValue: any
    let avgLength: number | undefined

    if (dataType === "number") {
      const numbers = nonNullValues.map((v) => Number(v)).filter((n) => !isNaN(n))
      minValue = numbers.length > 0 ? Math.min(...numbers) : undefined
      maxValue = numbers.length > 0 ? Math.max(...numbers) : undefined
    } else if (dataType === "string") {
      const lengths = nonNullValues.map((v) => String(v).length)
      avgLength = lengths.length > 0 ? lengths.reduce((sum, len) => sum + len, 0) / lengths.length : 0
      minValue = Math.min(...lengths)
      maxValue = Math.max(...lengths)
    } else if (dataType === "date") {
      const dates = nonNullValues.map((v) => new Date(v)).filter((d) => !isNaN(d.getTime()))
      minValue = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : undefined
      maxValue = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined
    }

    // Common values
    const valueCounts = new Map<any, number>()
    for (const value of nonNullValues) {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1)
    }

    const commonValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }))

    // Pattern detection
    const patterns = this.detectPatterns(nonNullValues)

    // Quality score calculation
    const qualityScore = this.calculateQualityScore({
      nullCount,
      totalCount: values.length,
      uniqueCount,
      dataType,
      patterns,
    })

    return {
      field,
      dataType,
      nullCount,
      uniqueCount,
      minValue,
      maxValue,
      avgLength,
      commonValues,
      patterns,
      qualityScore,
    }
  }

  private detectDataType(values: any[]): string {
    if (values.length === 0) return "unknown"

    const sample = values.slice(0, Math.min(100, values.length))

    // Check for numbers
    const numberCount = sample.filter((v) => !isNaN(Number(v)) && v !== "").length
    if (numberCount / sample.length > 0.8) return "number"

    // Check for booleans
    const booleanCount = sample.filter(
      (v) => typeof v === "boolean" || (typeof v === "string" && /^(true|false|yes|no|1|0)$/i.test(v)),
    ).length
    if (booleanCount / sample.length > 0.8) return "boolean"

    // Check for dates
    const dateCount = sample.filter((v) => {
      const date = new Date(v)
      return !isNaN(date.getTime()) && String(v).length > 4
    }).length
    if (dateCount / sample.length > 0.8) return "date"

    // Check for emails
    const emailCount = sample.filter((v) => typeof v === "string" && /^[\w.-]+@[\w.-]+\.\w+$/.test(v)).length
    if (emailCount / sample.length > 0.8) return "email"

    // Check for URLs
    const urlCount = sample.filter((v) => {
      try {
        new URL(v)
        return true
      } catch {
        return false
      }
    }).length
    if (urlCount / sample.length > 0.8) return "url"

    return "string"
  }

  private detectPatterns(values: any[]): Array<{ pattern: string; count: number }> {
    const patterns = new Map<string, number>()

    for (const value of values) {
      const str = String(value)

      // Detect common patterns
      if (/^\d{3}-\d{2}-\d{4}$/.test(str)) {
        patterns.set("SSN", (patterns.get("SSN") || 0) + 1)
      } else if (/^\d{3}-\d{3}-\d{4}$/.test(str)) {
        patterns.set("Phone (XXX-XXX-XXXX)", (patterns.get("Phone (XXX-XXX-XXXX)") || 0) + 1)
      } else if (/^$$\d{3}$$ \d{3}-\d{4}$/.test(str)) {
        patterns.set("Phone ((XXX) XXX-XXXX)", (patterns.get("Phone ((XXX) XXX-XXXX)") || 0) + 1)
      } else if (/^\d{5}(-\d{4})?$/.test(str)) {
        patterns.set("ZIP Code", (patterns.get("ZIP Code") || 0) + 1)
      } else if (/^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/.test(str)) {
        patterns.set("IBAN", (patterns.get("IBAN") || 0) + 1)
      } else if (/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(str)) {
        patterns.set("Credit Card", (patterns.get("Credit Card") || 0) + 1)
      }
    }

    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pattern, count]) => ({ pattern, count }))
  }

  private calculateQualityScore(metrics: {
    nullCount: number
    totalCount: number
    uniqueCount: number
    dataType: string
    patterns: Array<{ pattern: string; count: number }>
  }): number {
    let score = 100

    // Penalize for null values
    const nullRatio = metrics.nullCount / metrics.totalCount
    score -= nullRatio * 30

    // Penalize for low uniqueness (except for categorical data)
    if (metrics.dataType !== "boolean") {
      const uniquenessRatio = metrics.uniqueCount / (metrics.totalCount - metrics.nullCount)
      if (uniquenessRatio < 0.1) {
        score -= 20
      } else if (uniquenessRatio < 0.5) {
        score -= 10
      }
    }

    // Bonus for recognized patterns
    if (metrics.patterns.length > 0) {
      const patternCoverage = metrics.patterns[0].count / (metrics.totalCount - metrics.nullCount)
      if (patternCoverage > 0.8) {
        score += 10
      }
    }

    // Penalize for unknown data type
    if (metrics.dataType === "unknown") {
      score -= 15
    }

    return Math.max(0, Math.min(100, score))
  }

  private generateRulesForField(profile: DataProfile): CleansingRule[] {
    const rules: CleansingRule[] = []

    // Generate rules based on data type
    switch (profile.dataType) {
      case "email":
        rules.push({
          id: `${profile.field}_email_validation`,
          name: `Validate ${profile.field} Email Format`,
          field: profile.field,
          type: "validate_type",
          parameters: { expectedType: "email" },
          enabled: true,
        })
        break

      case "number":
        if (profile.minValue !== undefined && profile.maxValue !== undefined) {
          rules.push({
            id: `${profile.field}_range_validation`,
            name: `Validate ${profile.field} Range`,
            field: profile.field,
            type: "validate_type",
            parameters: { expectedType: "number", minValue: profile.minValue, maxValue: profile.maxValue },
            enabled: false, // Disabled by default, user should review
          })
        }
        break

      case "string":
        if (profile.avgLength && profile.avgLength > 0) {
          rules.push({
            id: `${profile.field}_length_validation`,
            name: `Validate ${profile.field} Length`,
            field: profile.field,
            type: "validate_type",
            parameters: { expectedType: "string", maxLength: Math.ceil(profile.avgLength * 3) },
            enabled: false,
          })
        }
        break
    }

    // Generate rules based on quality issues
    if (profile.nullCount > 0) {
      rules.push({
        id: `${profile.field}_null_handling`,
        name: `Handle Null Values in ${profile.field}`,
        field: profile.field,
        type: "transform_value",
        parameters: { transformation: "replace", replacement: this.suggestDefaultValue(profile) },
        enabled: false,
      })
    }

    return rules
  }

  private suggestDefaultValue(profile: DataProfile): any {
    switch (profile.dataType) {
      case "number":
        return 0
      case "string":
        return ""
      case "boolean":
        return false
      case "date":
        return new Date().toISOString()
      default:
        return null
    }
  }
}

export const dataCleanser = new DataCleanser()
