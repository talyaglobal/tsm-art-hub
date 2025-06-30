export interface SchemaAnalysis {
  id: string
  schema: Record<string, any>
  suggestions: SchemaSuggestion[]
  qualityScore: number
  analyzedAt: string
  dataTypes: DataTypeAnalysis[]
  relationships: SchemaRelationship[]
}

export interface SchemaSuggestion {
  type: "optimization" | "validation" | "indexing" | "normalization"
  field: string
  message: string
  impact: "low" | "medium" | "high"
  autoFixable: boolean
}

export interface DataTypeAnalysis {
  field: string
  detectedType: string
  confidence: number
  suggestedType?: string
  examples: any[]
}

export interface SchemaRelationship {
  sourceField: string
  targetField: string
  type: "one-to-one" | "one-to-many" | "many-to-many"
  confidence: number
}

export interface FieldMapping {
  id: string
  sourceField: string
  targetField: string
  transformation?: string
  confidence: number
  mappingType: "direct" | "transformed" | "calculated"
  validationRules?: ValidationRule[]
}

export interface ValidationRule {
  type: "required" | "format" | "range" | "custom"
  rule: string
  message: string
}

export interface MappingSuggestion {
  sourceField: string
  targetField: string
  confidence: number
  reasoning: string
  transformation?: string
}

export interface AnomalyDetection {
  id: string
  type: "data_quality" | "performance" | "volume" | "pattern"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  detectedAt: string
  affectedRecords: number
  suggestedActions: string[]
  autoResolvable: boolean
}

export interface DataQualityMetrics {
  completeness: number
  accuracy: number
  consistency: number
  validity: number
  uniqueness: number
  timeliness: number
  overallScore: number
}

export interface CleaningRule {
  id: string
  name: string
  description: string
  field: string
  ruleType: "remove_duplicates" | "standardize_format" | "fill_missing" | "validate_range" | "custom"
  parameters: Record<string, any>
  confidence: number
  estimatedImpact: number
}

export interface NLPQuery {
  query: string
  intent: "create_integration" | "analyze_data" | "generate_report" | "troubleshoot"
  entities: NLPEntity[]
  confidence: number
  suggestedActions: NLPAction[]
}

export interface NLPEntity {
  type: "source" | "destination" | "field" | "operation" | "condition"
  value: string
  confidence: number
}

export interface NLPAction {
  type: string
  description: string
  parameters: Record<string, any>
  confidence: number
}

export interface HealthPrediction {
  integrationId: string
  currentHealth: number
  predictedHealth: number
  timeframe: string
  riskFactors: RiskFactor[]
  recommendations: string[]
  confidence: number
}

export interface RiskFactor {
  factor: string
  impact: number
  likelihood: number
  description: string
}

export interface AIIntegration {
  id: string
  name: string
  type: "openai" | "cohere" | "huggingface" | "custom"
  config: Record<string, any>
  status: "active" | "inactive" | "error"
  lastSync?: Date
  errorMessage?: string
}
