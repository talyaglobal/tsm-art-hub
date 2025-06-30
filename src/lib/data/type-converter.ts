interface ConversionRule {
  sourceType: string
  targetType: string
  converter: (value: any) => any
  validator?: (value: any) => boolean
}

interface ConversionResult {
  success: boolean
  convertedValue?: any
  error?: string
  originalType: string
  targetType: string
}

export class TypeConverter {
  private rules: Map<string, ConversionRule> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules(): void {
    // String conversions
    this.addRule({
      sourceType: "string",
      targetType: "number",
      converter: (value: string) => {
        const num = Number(value)
        if (isNaN(num)) throw new Error("Invalid number format")
        return num
      },
      validator: (value: string) => !isNaN(Number(value)),
    })

    this.addRule({
      sourceType: "string",
      targetType: "boolean",
      converter: (value: string) => {
        const lower = value.toLowerCase().trim()
        if (["true", "1", "yes", "on"].includes(lower)) return true
        if (["false", "0", "no", "off"].includes(lower)) return false
        throw new Error("Invalid boolean format")
      },
      validator: (value: string) => {
        const lower = value.toLowerCase().trim()
        return ["true", "false", "1", "0", "yes", "no", "on", "off"].includes(lower)
      },
    })

    this.addRule({
      sourceType: "string",
      targetType: "date",
      converter: (value: string) => {
        const date = new Date(value)
        if (isNaN(date.getTime())) throw new Error("Invalid date format")
        return date
      },
      validator: (value: string) => !isNaN(Date.parse(value)),
    })

    // Number conversions
    this.addRule({
      sourceType: "number",
      targetType: "string",
      converter: (value: number) => String(value),
    })

    this.addRule({
      sourceType: "number",
      targetType: "boolean",
      converter: (value: number) => Boolean(value),
    })

    // Boolean conversions
    this.addRule({
      sourceType: "boolean",
      targetType: "string",
      converter: (value: boolean) => String(value),
    })

    this.addRule({
      sourceType: "boolean",
      targetType: "number",
      converter: (value: boolean) => (value ? 1 : 0),
    })

    // Date conversions
    this.addRule({
      sourceType: "date",
      targetType: "string",
      converter: (value: Date) => value.toISOString(),
    })

    this.addRule({
      sourceType: "date",
      targetType: "number",
      converter: (value: Date) => value.getTime(),
    })
  }

  addRule(rule: ConversionRule): void {
    const key = `${rule.sourceType}_to_${rule.targetType}`
    this.rules.set(key, rule)
  }

  convert(value: any, targetType: string): ConversionResult {
    const sourceType = this.detectType(value)
    const key = `${sourceType}_to_${targetType}`
    const rule = this.rules.get(key)

    if (!rule) {
      return {
        success: false,
        error: `No conversion rule found for ${sourceType} to ${targetType}`,
        originalType: sourceType,
        targetType,
      }
    }

    try {
      // Validate if validator exists
      if (rule.validator && !rule.validator(value)) {
        return {
          success: false,
          error: `Value validation failed for ${sourceType} to ${targetType}`,
          originalType: sourceType,
          targetType,
        }
      }

      const convertedValue = rule.converter(value)
      return {
        success: true,
        convertedValue,
        originalType: sourceType,
        targetType,
      }
    } catch (error) {
      return {
        success: false,
        error: `Conversion failed: ${error}`,
        originalType: sourceType,
        targetType,
      }
    }
  }

  convertBatch(
    data: Record<string, any>[],
    conversions: Record<string, string>,
  ): {
    convertedData: Record<string, any>[]
    errors: Array<{ row: number; field: string; error: string }>
  } {
    const convertedData: Record<string, any>[] = []
    const errors: Array<{ row: number; field: string; error: string }> = []

    for (let i = 0; i < data.length; i++) {
      const row = { ...data[i] }

      for (const [field, targetType] of Object.entries(conversions)) {
        if (field in row) {
          const result = this.convert(row[field], targetType)
          if (result.success) {
            row[field] = result.convertedValue
          } else {
            errors.push({
              row: i,
              field,
              error: result.error || "Unknown conversion error",
            })
          }
        }
      }

      convertedData.push(row)
    }

    return { convertedData, errors }
  }

  private detectType(value: any): string {
    if (value === null || value === undefined) return "null"
    if (typeof value === "string") return "string"
    if (typeof value === "number") return "number"
    if (typeof value === "boolean") return "boolean"
    if (value instanceof Date) return "date"
    if (Array.isArray(value)) return "array"
    if (typeof value === "object") return "object"
    return "unknown"
  }

  getSupportedConversions(): Array<{ from: string; to: string }> {
    return Array.from(this.rules.keys()).map((key) => {
      const [from, to] = key.split("_to_")
      return { from, to }
    })
  }

  canConvert(sourceType: string, targetType: string): boolean {
    const key = `${sourceType}_to_${targetType}`
    return this.rules.has(key)
  }
}

export const typeConverter = new TypeConverter()
