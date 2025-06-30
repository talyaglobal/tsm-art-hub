interface FieldSchema {
  name: string
  type: "string" | "number" | "boolean" | "date" | "array" | "object" | "null"
  nullable: boolean
  unique: boolean
  examples: any[]
  constraints?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    enum?: any[]
  }
  confidence: number
}

interface InferredSchema {
  fields: FieldSchema[]
  rowCount: number
  confidence: number
  metadata: {
    inferredAt: Date
    sampleSize: number
    uniqueValues: Record<string, number>
    nullCounts: Record<string, number>
  }
}

export class SchemaInference {
  private readonly sampleSize = 1000
  private readonly confidenceThreshold = 0.8

  async inferSchema(data: Record<string, any>[]): Promise<InferredSchema> {
    if (!data || data.length === 0) {
      throw new Error("No data provided for schema inference")
    }

    const sampleData = this.getSample(data)
    const fieldNames = this.extractFieldNames(sampleData)
    const fields: FieldSchema[] = []

    for (const fieldName of fieldNames) {
      const fieldSchema = this.inferFieldSchema(fieldName, sampleData)
      fields.push(fieldSchema)
    }

    const overallConfidence = this.calculateOverallConfidence(fields)
    const metadata = this.generateMetadata(sampleData)

    return {
      fields,
      rowCount: data.length,
      confidence: overallConfidence,
      metadata,
    }
  }

  private getSample(data: Record<string, any>[]): Record<string, any>[] {
    if (data.length <= this.sampleSize) {
      return data
    }

    // Random sampling
    const sample: Record<string, any>[] = []
    const step = Math.floor(data.length / this.sampleSize)

    for (let i = 0; i < data.length; i += step) {
      if (sample.length < this.sampleSize) {
        sample.push(data[i])
      }
    }

    return sample
  }

  private extractFieldNames(data: Record<string, any>[]): string[] {
    const fieldSet = new Set<string>()

    for (const row of data) {
      Object.keys(row).forEach((key) => fieldSet.add(key))
    }

    return Array.from(fieldSet)
  }

  private inferFieldSchema(fieldName: string, data: Record<string, any>[]): FieldSchema {
    const values = data.map((row) => row[fieldName])
    const nonNullValues = values.filter((v) => v !== null && v !== undefined)

    const typeAnalysis = this.analyzeTypes(nonNullValues)
    const primaryType = this.determinePrimaryType(typeAnalysis)

    const nullable = values.length > nonNullValues.length
    const unique = this.isUnique(nonNullValues)
    const examples = this.getExamples(nonNullValues, 5)
    const constraints = this.inferConstraints(nonNullValues, primaryType)
    const confidence = this.calculateFieldConfidence(typeAnalysis, nonNullValues.length, values.length)

    return {
      name: fieldName,
      type: primaryType,
      nullable,
      unique,
      examples,
      constraints,
      confidence,
    }
  }

  private analyzeTypes(values: any[]): Record<string, number> {
    const typeCounts: Record<string, number> = {}

    for (const value of values) {
      const type = this.detectValueType(value)
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }

    return typeCounts
  }

  private detectValueType(value: any): string {
    if (value === null || value === undefined) return "null"

    if (typeof value === "string") {
      // Check for date patterns
      if (this.isDateString(value)) return "date"
      // Check for number patterns
      if (this.isNumericString(value)) return "number"
      // Check for boolean patterns
      if (this.isBooleanString(value)) return "boolean"
      return "string"
    }

    if (typeof value === "number") return "number"
    if (typeof value === "boolean") return "boolean"
    if (value instanceof Date) return "date"
    if (Array.isArray(value)) return "array"
    if (typeof value === "object") return "object"

    return "string"
  }

  private isDateString(value: string): boolean {
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{2}-\d{2}-\d{4}$/,
    ]

    return datePatterns.some((pattern) => pattern.test(value)) && !isNaN(Date.parse(value))
  }

  private isNumericString(value: string): boolean {
    return /^-?\d+\.?\d*$/.test(value.trim()) && !isNaN(Number(value))
  }

  private isBooleanString(value: string): boolean {
    const lower = value.toLowerCase().trim()
    return ["true", "false", "1", "0", "yes", "no", "on", "off"].includes(lower)
  }

  private determinePrimaryType(typeAnalysis: Record<string, number>): FieldSchema["type"] {
    const entries = Object.entries(typeAnalysis).sort((a, b) => b[1] - a[1])

    if (entries.length === 0) return "null"

    const [primaryType] = entries[0]
    return primaryType as FieldSchema["type"]
  }

  private isUnique(values: any[]): boolean {
    const uniqueValues = new Set(values.map((v) => JSON.stringify(v)))
    return uniqueValues.size === values.length
  }

  private getExamples(values: any[], count: number): any[] {
    const uniqueValues = Array.from(new Set(values))
    return uniqueValues.slice(0, count)
  }

  private inferConstraints(values: any[], type: FieldSchema["type"]): FieldSchema["constraints"] {
    const constraints: FieldSchema["constraints"] = {}

    switch (type) {
      case "string":
        const lengths = values.map((v) => String(v).length)
        constraints.minLength = Math.min(...lengths)
        constraints.maxLength = Math.max(...lengths)

        // Check for enum-like patterns
        const uniqueValues = Array.from(new Set(values))
        if (uniqueValues.length <= 10 && uniqueValues.length < values.length * 0.1) {
          constraints.enum = uniqueValues
        }
        break

      case "number":
        const numbers = values.map((v) => Number(v)).filter((n) => !isNaN(n))
        if (numbers.length > 0) {
          constraints.min = Math.min(...numbers)
          constraints.max = Math.max(...numbers)
        }
        break

      case "date":
        const dates = values.map((v) => new Date(v)).filter((d) => !isNaN(d.getTime()))
        if (dates.length > 0) {
          constraints.min = Math.min(...dates.map((d) => d.getTime()))
          constraints.max = Math.max(...dates.map((d) => d.getTime()))
        }
        break
    }

    return constraints
  }

  private calculateFieldConfidence(
    typeAnalysis: Record<string, number>,
    nonNullCount: number,
    totalCount: number,
  ): number {
    if (totalCount === 0) return 0

    const entries = Object.entries(typeAnalysis).sort((a, b) => b[1] - a[1])
    if (entries.length === 0) return 0

    const [, primaryTypeCount] = entries[0]
    const typeConsistency = primaryTypeCount / nonNullCount
    const completeness = nonNullCount / totalCount

    return typeConsistency * 0.7 + completeness * 0.3
  }

  private calculateOverallConfidence(fields: FieldSchema[]): number {
    if (fields.length === 0) return 0

    const totalConfidence = fields.reduce((sum, field) => sum + field.confidence, 0)
    return totalConfidence / fields.length
  }

  private generateMetadata(data: Record<string, any>[]): InferredSchema["metadata"] {
    const uniqueValues: Record<string, number> = {}
    const nullCounts: Record<string, number> = {}
    const fieldNames = this.extractFieldNames(data)

    for (const fieldName of fieldNames) {
      const values = data.map((row) => row[fieldName])
      const nonNullValues = values.filter((v) => v !== null && v !== undefined)
      const uniqueSet = new Set(nonNullValues.map((v) => JSON.stringify(v)))

      uniqueValues[fieldName] = uniqueSet.size
      nullCounts[fieldName] = values.length - nonNullValues.length
    }

    return {
      inferredAt: new Date(),
      sampleSize: data.length,
      uniqueValues,
      nullCounts,
    }
  }

  async validateAgainstSchema(
    data: Record<string, any>[],
    schema: InferredSchema,
  ): Promise<{
    isValid: boolean
    errors: Array<{
      row: number
      field: string
      error: string
      value: any
    }>
    summary: {
      totalRows: number
      validRows: number
      errorCount: number
    }
  }> {
    const errors: Array<{ row: number; field: string; error: string; value: any }> = []

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex]

      for (const fieldSchema of schema.fields) {
        const value = row[fieldSchema.name]
        const validationResult = this.validateFieldValue(value, fieldSchema)

        if (!validationResult.isValid) {
          errors.push({
            row: rowIndex,
            field: fieldSchema.name,
            error: validationResult.error || "Validation failed",
            value,
          })
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      summary: {
        totalRows: data.length,
        validRows: data.length - errors.length,
        errorCount: errors.length,
      },
    }
  }

  private validateFieldValue(value: any, fieldSchema: FieldSchema): { isValid: boolean; error?: string } {
    // Check nullability
    if ((value === null || value === undefined) && !fieldSchema.nullable) {
      return { isValid: false, error: "Field cannot be null" }
    }

    if (value === null || value === undefined) {
      return { isValid: true }
    }

    // Check type
    const actualType = this.detectValueType(value)
    if (actualType !== fieldSchema.type) {
      return { isValid: false, error: `Expected ${fieldSchema.type}, got ${actualType}` }
    }

    // Check constraints
    if (fieldSchema.constraints) {
      const constraintValidation = this.validateConstraints(value, fieldSchema.constraints, fieldSchema.type)
      if (!constraintValidation.isValid) {
        return constraintValidation
      }
    }

    return { isValid: true }
  }

  private validateConstraints(
    value: any,
    constraints: FieldSchema["constraints"],
    type: FieldSchema["type"],
  ): { isValid: boolean; error?: string } {
    if (!constraints) return { isValid: true }

    switch (type) {
      case "string":
        const strValue = String(value)
        if (constraints.minLength !== undefined && strValue.length < constraints.minLength) {
          return { isValid: false, error: `String too short (min: ${constraints.minLength})` }
        }
        if (constraints.maxLength !== undefined && strValue.length > constraints.maxLength) {
          return { isValid: false, error: `String too long (max: ${constraints.maxLength})` }
        }
        if (constraints.enum && !constraints.enum.includes(value)) {
          return { isValid: false, error: `Value not in allowed enum` }
        }
        break

      case "number":
        const numValue = Number(value)
        if (constraints.min !== undefined && numValue < constraints.min) {
          return { isValid: false, error: `Number too small (min: ${constraints.min})` }
        }
        if (constraints.max !== undefined && numValue > constraints.max) {
          return { isValid: false, error: `Number too large (max: ${constraints.max})` }
        }
        break
    }

    return { isValid: true }
  }
}

export const schemaInference = new SchemaInference()
