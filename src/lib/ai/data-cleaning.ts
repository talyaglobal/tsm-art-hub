interface DataQualityIssue {
  type: "missing" | "duplicate" | "invalid" | "inconsistent" | "outlier"
  field: string
  description: string
  severity: "low" | "medium" | "high"
  affectedRows: number[]
  suggestedAction: string
}

interface CleaningRule {
  id: string
  name: string
  description: string
  field: string
  condition: string
  action: "remove" | "replace" | "transform" | "flag"
  parameters: Record<string, any>
  confidence: number
}

interface DataQualityReport {
  totalRows: number
  issuesFound: DataQualityIssue[]
  qualityScore: number
  recommendations: string[]
  cleaningRules: CleaningRule[]
}

export class DataCleaningService {
  private readonly qualityThresholds = {
    completeness: 0.95,
    uniqueness: 0.98,
    validity: 0.99,
    consistency: 0.97,
  }

  async analyzeDataQuality(data: Record<string, any>[]): Promise<DataQualityReport> {
    if (!data || data.length === 0) {
      throw new Error("No data provided for analysis")
    }

    const issues: DataQualityIssue[] = []
    const cleaningRules: CleaningRule[] = []

    // Analyze each field
    const fields = Object.keys(data[0])
    for (const field of fields) {
      const fieldIssues = await this.analyzeField(field, data)
      issues.push(...fieldIssues)

      const fieldRules = await this.generateCleaningRules(field, data, fieldIssues)
      cleaningRules.push(...fieldRules)
    }

    // Calculate overall quality score
    const qualityScore = this.calculateQualityScore(data, issues)

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues)

    return {
      totalRows: data.length,
      issuesFound: issues,
      qualityScore,
      recommendations,
      cleaningRules,
    }
  }

  async cleanData(
    data: Record<string, any>[],
    rules: CleaningRule[],
  ): Promise<{
    cleanedData: Record<string, any>[]
    appliedRules: string[]
    removedRows: number[]
    modifiedFields: Record<string, number>
  }> {
    let cleanedData = [...data]
    const appliedRules: string[] = []
    const removedRows: number[] = []
    const modifiedFields: Record<string, number> = {}

    for (const rule of rules) {
      const result = await this.applyCleaningRule(cleanedData, rule)
      cleanedData = result.data

      if (result.applied) {
        appliedRules.push(rule.id)

        if (rule.action === "remove") {
          removedRows.push(...result.affectedRows)
        } else {
          modifiedFields[rule.field] = (modifiedFields[rule.field] || 0) + result.affectedRows.length
        }
      }
    }

    return {
      cleanedData,
      appliedRules,
      removedRows,
      modifiedFields,
    }
  }

  async generateCleaningRules(
    field: string,
    data: Record<string, any>[],
    issues: DataQualityIssue[],
  ): Promise<CleaningRule[]> {
    const rules: CleaningRule[] = []
    const fieldIssues = issues.filter((issue) => issue.field === field)

    for (const issue of fieldIssues) {
      const rule = await this.createRuleForIssue(field, issue, data)
      if (rule) {
        rules.push(rule)
      }
    }

    return rules
  }

  private async analyzeField(field: string, data: Record<string, any>[]): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = []
    const values = data.map((row, index) => ({ value: row[field], index }))

    // Check for missing values
    const missingValues = values.filter((v) => v.value == null || v.value === "")
    if (missingValues.length > 0) {
      issues.push({
        type: "missing",
        field,
        description: `${missingValues.length} missing values found`,
        severity: missingValues.length / data.length > 0.1 ? "high" : "medium",
        affectedRows: missingValues.map((v) => v.index),
        suggestedAction: "Fill with default value or remove rows",
      })
    }

    // Check for duplicates
    const nonNullValues = values.filter((v) => v.value != null && v.value !== "")
    const uniqueValues = new Set(nonNullValues.map((v) => v.value))
    const duplicateCount = nonNullValues.length - uniqueValues.size

    if (duplicateCount > 0) {
      const duplicateRows = this.findDuplicateRows(nonNullValues)
      issues.push({
        type: "duplicate",
        field,
        description: `${duplicateCount} duplicate values found`,
        severity: duplicateCount / data.length > 0.05 ? "high" : "low",
        affectedRows: duplicateRows,
        suggestedAction: "Remove duplicate entries or merge records",
      })
    }

    // Check for invalid values based on data type
    const invalidValues = this.findInvalidValues(field, nonNullValues)
    if (invalidValues.length > 0) {
      issues.push({
        type: "invalid",
        field,
        description: `${invalidValues.length} invalid values found`,
        severity: "high",
        affectedRows: invalidValues.map((v) => v.index),
        suggestedAction: "Correct or remove invalid values",
      })
    }

    // Check for outliers (numeric fields only)
    if (this.isNumericField(nonNullValues)) {
      const outliers = this.findOutliers(nonNullValues)
      if (outliers.length > 0) {
        issues.push({
          type: "outlier",
          field,
          description: `${outliers.length} potential outliers found`,
          severity: "medium",
          affectedRows: outliers.map((v) => v.index),
          suggestedAction: "Review outliers for data entry errors",
        })
      }
    }

    // Check for inconsistent formatting
    const inconsistentValues = this.findInconsistentFormatting(field, nonNullValues)
    if (inconsistentValues.length > 0) {
      issues.push({
        type: "inconsistent",
        field,
        description: `${inconsistentValues.length} inconsistently formatted values`,
        severity: "medium",
        affectedRows: inconsistentValues.map((v) => v.index),
        suggestedAction: "Standardize formatting",
      })
    }

    return issues
  }

  private findDuplicateRows(values: Array<{ value: any; index: number }>): number[] {
    const seen = new Map<any, number>()
    const duplicates: number[] = []

    for (const { value, index } of values) {
      if (seen.has(value)) {
        duplicates.push(index)
      } else {
        seen.set(value, index)
      }
    }

    return duplicates
  }

  private findInvalidValues(
    field: string,
    values: Array<{ value: any; index: number }>,
  ): Array<{ value: any; index: number }> {
    const invalid: Array<{ value: any; index: number }> = []

    for (const item of values) {
      if (!this.isValidValue(field, item.value)) {
        invalid.push(item)
      }
    }

    return invalid
  }

  private isValidValue(field: string, value: any): boolean {
    // Email validation
    if (field.toLowerCase().includes("email")) {
      return /^[\w.-]+@[\w.-]+\.\w+$/.test(value)
    }

    // Phone validation
    if (field.toLowerCase().includes("phone")) {
      return /^[\d\s\-+$$$$]+$/.test(value)
    }

    // Date validation
    if (field.toLowerCase().includes("date")) {
      return !isNaN(Date.parse(value))
    }

    // URL validation
    if (field.toLowerCase().includes("url")) {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }

    return true
  }

  private isNumericField(values: Array<{ value: any; index: number }>): boolean {
    return values.every((v) => typeof v.value === "number" || !isNaN(Number(v.value)))
  }

  private findOutliers(values: Array<{ value: any; index: number }>): Array<{ value: any; index: number }> {
    const numericValues = values.map((v) => Number(v.value)).filter((v) => !isNaN(v))

    if (numericValues.length < 4) return []

    // Calculate IQR
    const sorted = numericValues.sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    return values.filter((v) => {
      const num = Number(v.value)
      return !isNaN(num) && (num < lowerBound || num > upperBound)
    })
  }

  private findInconsistentFormatting(
    field: string,
    values: Array<{ value: any; index: number }>,
  ): Array<{ value: any; index: number }> {
    const inconsistent: Array<{ value: any; index: number }> = []

    // Check for mixed case in text fields
    if (field.toLowerCase().includes("name") || field.toLowerCase().includes("title")) {
      const patterns = new Set<string>()

      for (const item of values) {
        const str = String(item.value)
        if (str === str.toLowerCase()) patterns.add("lowercase")
        else if (str === str.toUpperCase()) patterns.add("uppercase")
        else if (str === str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) patterns.add("titlecase")
        else patterns.add("mixed")
      }

      if (patterns.size > 1) {
        // Find values that don't match the most common pattern
        const patternCounts = new Map<string, number>()
        for (const item of values) {
          const str = String(item.value)
          let pattern = "mixed"
          if (str === str.toLowerCase()) pattern = "lowercase"
          else if (str === str.toUpperCase()) pattern = "uppercase"
          else if (str === str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) pattern = "titlecase"

          patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1)
        }

        const mostCommon = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]

        for (const item of values) {
          const str = String(item.value)
          let pattern = "mixed"
          if (str === str.toLowerCase()) pattern = "lowercase"
          else if (str === str.toUpperCase()) pattern = "uppercase"
          else if (str === str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) pattern = "titlecase"

          if (pattern !== mostCommon) {
            inconsistent.push(item)
          }
        }
      }
    }

    return inconsistent
  }

  private calculateQualityScore(data: Record<string, any>[], issues: DataQualityIssue[]): number {
    const totalCells = data.length * Object.keys(data[0] || {}).length
    const totalIssues = issues.reduce((sum, issue) => sum + issue.affectedRows.length, 0)

    const baseScore = Math.max(0, (totalCells - totalIssues) / totalCells)

    // Apply severity weights
    const severityWeights = { low: 0.1, medium: 0.3, high: 0.6 }
    const weightedIssues = issues.reduce((sum, issue) => {
      return sum + issue.affectedRows.length * severityWeights[issue.severity]
    }, 0)

    const adjustedScore = Math.max(0, baseScore - weightedIssues / totalCells)

    return Math.round(adjustedScore * 100) / 100
  }

  private generateRecommendations(issues: DataQualityIssue[]): string[] {
    const recommendations: string[] = []

    const highSeverityIssues = issues.filter((issue) => issue.severity === "high")
    if (highSeverityIssues.length > 0) {
      recommendations.push("Address high severity data quality issues immediately")
    }

    const missingValueIssues = issues.filter((issue) => issue.type === "missing")
    if (missingValueIssues.length > 0) {
      recommendations.push("Implement data validation at the source to prevent missing values")
    }

    const duplicateIssues = issues.filter((issue) => issue.type === "duplicate")
    if (duplicateIssues.length > 0) {
      recommendations.push("Review data collection processes to prevent duplicates")
    }

    const invalidIssues = issues.filter((issue) => issue.type === "invalid")
    if (invalidIssues.length > 0) {
      recommendations.push("Add input validation and data type constraints")
    }

    return recommendations
  }

  private async createRuleForIssue(
    field: string,
    issue: DataQualityIssue,
    data: Record<string, any>[],
  ): Promise<CleaningRule | null> {
    const ruleId = `${field}_${issue.type}_${Date.now()}`

    switch (issue.type) {
      case "missing":
        return {
          id: ruleId,
          name: `Fill missing values in ${field}`,
          description: `Replace null/empty values with default`,
          field,
          condition: 'value == null || value === ""',
          action: "replace",
          parameters: { defaultValue: this.suggestDefaultValue(field, data) },
          confidence: 0.8,
        }

      case "duplicate":
        return {
          id: ruleId,
          name: `Remove duplicates in ${field}`,
          description: `Keep only the first occurrence of duplicate values`,
          field,
          condition: "isDuplicate(value)",
          action: "remove",
          parameters: {},
          confidence: 0.9,
        }

      case "invalid":
        return {
          id: ruleId,
          name: `Fix invalid values in ${field}`,
          description: `Correct or remove invalid data`,
          field,
          condition: "isInvalid(value)",
          action: "transform",
          parameters: { transformation: this.suggestTransformation(field) },
          confidence: 0.7,
        }

      case "inconsistent":
        return {
          id: ruleId,
          name: `Standardize format in ${field}`,
          description: `Apply consistent formatting`,
          field,
          condition: "isInconsistent(value)",
          action: "transform",
          parameters: { transformation: this.suggestFormatting(field, data) },
          confidence: 0.8,
        }

      case "outlier":
        return {
          id: ruleId,
          name: `Flag outliers in ${field}`,
          description: `Mark potential outliers for review`,
          field,
          condition: "isOutlier(value)",
          action: "flag",
          parameters: { flagName: "potential_outlier" },
          confidence: 0.6,
        }

      default:
        return null
    }
  }

  private suggestDefaultValue(field: string, data: Record<string, any>[]): any {
    const values = data.map((row) => row[field]).filter((v) => v != null && v !== "")

    if (values.length === 0) return null

    // For numeric fields, use median
    if (values.every((v) => typeof v === "number" || !isNaN(Number(v)))) {
      const numbers = values.map((v) => Number(v)).sort((a, b) => a - b)
      return numbers[Math.floor(numbers.length / 2)]
    }

    // For text fields, use most common value
    const counts = new Map<any, number>()
    for (const value of values) {
      counts.set(value, (counts.get(value) || 0) + 1)
    }

    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0]
  }

  private suggestTransformation(field: string): string {
    if (field.toLowerCase().includes("email")) {
      return "toLowerCase().trim()"
    }
    if (field.toLowerCase().includes("phone")) {
      return 'replace(/[^\\d]/g, "")'
    }
    if (field.toLowerCase().includes("name")) {
      return 'trim().replace(/\\s+/g, " ")'
    }
    return "trim()"
  }

  private suggestFormatting(field: string, data: Record<string, any>[]): string {
    const values = data.map((row) => row[field]).filter((v) => v != null && v !== "")

    if (field.toLowerCase().includes("name") || field.toLowerCase().includes("title")) {
      // Determine most common case pattern
      const patterns = new Map<string, number>()
      for (const value of values) {
        const str = String(value)
        if (str === str.toLowerCase()) patterns.set("toLowerCase()", (patterns.get("toLowerCase()") || 0) + 1)
        else if (str === str.toUpperCase()) patterns.set("toUpperCase()", (patterns.get("toUpperCase()") || 0) + 1)
        else patterns.set("toTitleCase()", (patterns.get("toTitleCase()") || 0) + 1)
      }

      return Array.from(patterns.entries()).sort((a, b) => b[1] - a[1])[0][0]
    }

    return "trim()"
  }

  private async applyCleaningRule(
    data: Record<string, any>[],
    rule: CleaningRule,
  ): Promise<{
    data: Record<string, any>[]
    applied: boolean
    affectedRows: number[]
  }> {
    const affectedRows: number[] = []
    const newData = [...data]

    try {
      for (let i = newData.length - 1; i >= 0; i--) {
        const row = newData[i]
        const value = row[rule.field]

        if (this.evaluateCondition(rule.condition, value, rule.field, newData)) {
          affectedRows.push(i)

          switch (rule.action) {
            case "remove":
              newData.splice(i, 1)
              break

            case "replace":
              row[rule.field] = rule.parameters.defaultValue
              break

            case "transform":
              row[rule.field] = this.applyTransformation(value, rule.parameters.transformation)
              break

            case "flag":
              row[`${rule.parameters.flagName}`] = true
              break
          }
        }
      }

      return {
        data: newData,
        applied: affectedRows.length > 0,
        affectedRows,
      }
    } catch (error) {
      return {
        data,
        applied: false,
        affectedRows: [],
      }
    }
  }

  private evaluateCondition(condition: string, value: any, field: string, data: Record<string, any>[]): boolean {
    try {
      // Simple condition evaluation - in production, use a proper expression evaluator
      if (condition === 'value == null || value === ""') {
        return value == null || value === ""
      }

      if (condition === "isDuplicate(value)") {
        const occurrences = data.filter((row) => row[field] === value).length
        return occurrences > 1
      }

      if (condition === "isInvalid(value)") {
        return !this.isValidValue(field, value)
      }

      if (condition === "isOutlier(value)") {
        const numericValues = data.map((row) => Number(row[field])).filter((v) => !isNaN(v))
        if (numericValues.length < 4) return false

        const sorted = numericValues.sort((a, b) => a - b)
        const q1 = sorted[Math.floor(sorted.length * 0.25)]
        const q3 = sorted[Math.floor(sorted.length * 0.75)]
        const iqr = q3 - q1
        const lowerBound = q1 - 1.5 * iqr
        const upperBound = q3 + 1.5 * iqr
        const num = Number(value)

        return !isNaN(num) && (num < lowerBound || num > upperBound)
      }

      return false
    } catch {
      return false
    }
  }

  private applyTransformation(value: any, transformation: string): any {
    try {
      const str = String(value)

      switch (transformation) {
        case "toLowerCase()":
          return str.toLowerCase()
        case "toUpperCase()":
          return str.toUpperCase()
        case "toTitleCase()":
          return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        case "trim()":
          return str.trim()
        case "toLowerCase().trim()":
          return str.toLowerCase().trim()
        case 'replace(/[^\\d]/g, "")':
          return str.replace(/[^\d]/g, "")
        case 'trim().replace(/\\s+/g, " ")':
          return str.trim().replace(/\s+/g, " ")
        default:
          return value
      }
    } catch {
      return value
    }
  }
}
