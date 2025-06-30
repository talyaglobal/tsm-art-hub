interface MappingRule {
  sourceField: string
  targetField: string
  transformation?: string
  confidence: number
  reasoning: string
}

interface SchemaMapping {
  sourceSchema: Record<string, any>
  targetSchema: Record<string, any>
  mappings: MappingRule[]
  overallConfidence: number
}

interface MappingSuggestion {
  field: string
  suggestions: Array<{
    target: string
    confidence: number
    transformation?: string
    reasoning: string
  }>
}

export class IntelligentMappingService {
  private readonly confidenceThreshold = 0.7

  async generateMapping(
    sourceSchema: Record<string, any>,
    targetSchema: Record<string, any>,
    sampleData?: Record<string, any>[],
  ): Promise<SchemaMapping> {
    try {
      const mappings = await this.analyzeSchemas(sourceSchema, targetSchema, sampleData)
      const overallConfidence = this.calculateOverallConfidence(mappings)

      return {
        sourceSchema,
        targetSchema,
        mappings,
        overallConfidence,
      }
    } catch (error) {
      throw new Error(`Failed to generate mapping: ${error}`)
    }
  }

  async suggestMappings(sourceFields: string[], targetSchema: Record<string, any>): Promise<MappingSuggestion[]> {
    const suggestions: MappingSuggestion[] = []

    for (const field of sourceFields) {
      const fieldSuggestions = await this.findBestMatches(field, targetSchema)
      suggestions.push({
        field,
        suggestions: fieldSuggestions,
      })
    }

    return suggestions
  }

  async validateMapping(mapping: SchemaMapping): Promise<{
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check for unmapped required fields
    const requiredTargetFields = Object.keys(mapping.targetSchema).filter((key) => mapping.targetSchema[key].required)

    const mappedTargetFields = mapping.mappings.map((m) => m.targetField)
    const unmappedRequired = requiredTargetFields.filter((field) => !mappedTargetFields.includes(field))

    if (unmappedRequired.length > 0) {
      issues.push(`Required fields not mapped: ${unmappedRequired.join(", ")}`)
    }

    // Check for low confidence mappings
    const lowConfidenceMappings = mapping.mappings.filter((m) => m.confidence < this.confidenceThreshold)

    if (lowConfidenceMappings.length > 0) {
      recommendations.push(
        `Review low confidence mappings: ${lowConfidenceMappings.map((m) => m.sourceField).join(", ")}`,
      )
    }

    // Check for data type compatibility
    for (const mappingRule of mapping.mappings) {
      const sourceType = mapping.sourceSchema[mappingRule.sourceField]?.type
      const targetType = mapping.targetSchema[mappingRule.targetField]?.type

      if (sourceType && targetType && !this.areTypesCompatible(sourceType, targetType)) {
        if (!mappingRule.transformation) {
          issues.push(
            `Type mismatch: ${mappingRule.sourceField} (${sourceType}) -> ${mappingRule.targetField} (${targetType})`,
          )
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    }
  }

  private async analyzeSchemas(
    sourceSchema: Record<string, any>,
    targetSchema: Record<string, any>,
    sampleData?: Record<string, any>[],
  ): Promise<MappingRule[]> {
    const mappings: MappingRule[] = []
    const sourceFields = Object.keys(sourceSchema)
    const targetFields = Object.keys(targetSchema)

    for (const sourceField of sourceFields) {
      const bestMatch = await this.findBestMatch(
        sourceField,
        targetFields,
        sourceSchema[sourceField],
        targetSchema,
        sampleData,
      )

      if (bestMatch) {
        mappings.push(bestMatch)
      }
    }

    return mappings
  }

  private async findBestMatch(
    sourceField: string,
    targetFields: string[],
    sourceFieldInfo: any,
    targetSchema: Record<string, any>,
    sampleData?: Record<string, any>[],
  ): Promise<MappingRule | null> {
    let bestMatch: MappingRule | null = null
    let highestConfidence = 0

    for (const targetField of targetFields) {
      const confidence = this.calculateFieldConfidence(
        sourceField,
        targetField,
        sourceFieldInfo,
        targetSchema[targetField],
        sampleData,
      )

      if (confidence > highestConfidence && confidence > 0.3) {
        const transformation = this.suggestTransformation(sourceFieldInfo, targetSchema[targetField])

        bestMatch = {
          sourceField,
          targetField,
          transformation,
          confidence,
          reasoning: this.generateReasoning(sourceField, targetField, confidence),
        }
        highestConfidence = confidence
      }
    }

    return bestMatch
  }

  private async findBestMatches(
    sourceField: string,
    targetSchema: Record<string, any>,
  ): Promise<
    Array<{
      target: string
      confidence: number
      transformation?: string
      reasoning: string
    }>
  > {
    const matches = []
    const targetFields = Object.keys(targetSchema)

    for (const targetField of targetFields) {
      const confidence = this.calculateFieldConfidence(sourceField, targetField, {}, targetSchema[targetField])

      if (confidence > 0.3) {
        matches.push({
          target: targetField,
          confidence,
          transformation: this.suggestTransformation({}, targetSchema[targetField]),
          reasoning: this.generateReasoning(sourceField, targetField, confidence),
        })
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  }

  private calculateFieldConfidence(
    sourceField: string,
    targetField: string,
    sourceInfo: any,
    targetInfo: any,
    sampleData?: Record<string, any>[],
  ): number {
    let confidence = 0

    // Name similarity
    const nameSimilarity = this.calculateStringSimilarity(sourceField, targetField)
    confidence += nameSimilarity * 0.4

    // Type compatibility
    if (sourceInfo.type && targetInfo.type) {
      const typeCompatibility = this.areTypesCompatible(sourceInfo.type, targetInfo.type) ? 1 : 0
      confidence += typeCompatibility * 0.3
    }

    // Semantic similarity
    const semanticSimilarity = this.calculateSemanticSimilarity(sourceField, targetField)
    confidence += semanticSimilarity * 0.2

    // Data pattern analysis
    if (sampleData && sampleData.length > 0) {
      const patternSimilarity = this.analyzeDataPatterns(sourceField, targetField, sampleData)
      confidence += patternSimilarity * 0.1
    }

    return Math.min(confidence, 1)
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  private calculateSemanticSimilarity(field1: string, field2: string): number {
    const synonyms: Record<string, string[]> = {
      id: ["identifier", "key", "uuid", "guid"],
      name: ["title", "label", "description"],
      email: ["mail", "email_address"],
      phone: ["telephone", "mobile", "contact"],
      date: ["timestamp", "created_at", "updated_at"],
      status: ["state", "condition", "flag"],
      amount: ["value", "price", "cost", "total"],
      address: ["location", "street", "place"],
    }

    const field1Lower = field1.toLowerCase()
    const field2Lower = field2.toLowerCase()

    for (const [key, values] of Object.entries(synonyms)) {
      if (
        (field1Lower.includes(key) || values.some((v) => field1Lower.includes(v))) &&
        (field2Lower.includes(key) || values.some((v) => field2Lower.includes(v)))
      ) {
        return 0.8
      }
    }

    return 0
  }

  private areTypesCompatible(sourceType: string, targetType: string): boolean {
    const typeCompatibility: Record<string, string[]> = {
      string: ["string", "text", "varchar", "char"],
      number: ["number", "integer", "float", "decimal", "int"],
      boolean: ["boolean", "bool", "bit"],
      date: ["date", "datetime", "timestamp"],
      array: ["array", "list"],
      object: ["object", "json", "jsonb"],
    }

    const sourceCompatible = typeCompatibility[sourceType.toLowerCase()] || [sourceType.toLowerCase()]
    return sourceCompatible.includes(targetType.toLowerCase())
  }

  private suggestTransformation(sourceInfo: any, targetInfo: any): string | undefined {
    if (!sourceInfo.type || !targetInfo.type) return undefined

    const sourceType = sourceInfo.type.toLowerCase()
    const targetType = targetInfo.type.toLowerCase()

    if (sourceType === "string" && targetType === "number") {
      return "parseFloat(value)"
    }

    if (sourceType === "number" && targetType === "string") {
      return "value.toString()"
    }

    if (sourceType === "string" && targetType === "date") {
      return "new Date(value)"
    }

    if (sourceType === "date" && targetType === "string") {
      return "value.toISOString()"
    }

    return undefined
  }

  private analyzeDataPatterns(sourceField: string, targetField: string, sampleData: Record<string, any>[]): number {
    // Analyze actual data patterns to determine similarity
    const sourceValues = sampleData.map((row) => row[sourceField]).filter((v) => v != null)
    const targetValues = sampleData.map((row) => row[targetField]).filter((v) => v != null)

    if (sourceValues.length === 0 || targetValues.length === 0) return 0

    // Simple pattern matching - could be enhanced with more sophisticated analysis
    const sourcePattern = this.detectPattern(sourceValues)
    const targetPattern = this.detectPattern(targetValues)

    return sourcePattern === targetPattern ? 0.8 : 0
  }

  private detectPattern(values: any[]): string {
    if (values.every((v) => typeof v === "string" && /^\d+$/.test(v))) return "numeric_string"
    if (values.every((v) => typeof v === "string" && /^[\w.-]+@[\w.-]+\.\w+$/.test(v))) return "email"
    if (values.every((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v))) return "date"
    if (values.every((v) => typeof v === "number")) return "number"
    if (values.every((v) => typeof v === "boolean")) return "boolean"
    return "generic"
  }

  private generateReasoning(sourceField: string, targetField: string, confidence: number): string {
    if (confidence > 0.8) {
      return `High confidence match based on field name similarity and type compatibility`
    } else if (confidence > 0.6) {
      return `Good match with some semantic similarity`
    } else if (confidence > 0.4) {
      return `Moderate match, may require transformation`
    } else {
      return `Low confidence match, manual review recommended`
    }
  }

  private calculateOverallConfidence(mappings: MappingRule[]): number {
    if (mappings.length === 0) return 0
    const totalConfidence = mappings.reduce((sum, mapping) => sum + mapping.confidence, 0)
    return totalConfidence / mappings.length
  }
}
