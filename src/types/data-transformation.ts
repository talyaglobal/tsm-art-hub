export interface DataSource {
  id: string
  name: string
  type: "database" | "api" | "file" | "stream" | "webhook"
  connection: ConnectionConfig
  schema?: DataSchema
  metadata: Record<string, any>
  status: "active" | "inactive" | "error"
  lastSync?: string
}

export interface ConnectionConfig {
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  url?: string
  headers?: Record<string, string>
  authentication?: AuthConfig
  ssl?: boolean
  timeout?: number
  retries?: number
}

export interface AuthConfig {
  type: "none" | "basic" | "bearer" | "oauth2" | "api_key"
  credentials: Record<string, string>
  tokenUrl?: string
  scope?: string[]
}

export interface DataSchema {
  fields: SchemaField[]
  primaryKey?: string[]
  indexes?: SchemaIndex[]
  constraints?: SchemaConstraint[]
  metadata: Record<string, any>
}

export interface SchemaField {
  name: string
  type: "string" | "number" | "boolean" | "date" | "object" | "array"
  nullable: boolean
  defaultValue?: any
  description?: string
  validation?: FieldValidation
  transformation?: FieldTransformation
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  enum?: any[]
  custom?: string
}

export interface FieldTransformation {
  type: "map" | "filter" | "aggregate" | "join" | "split" | "format"
  config: Record<string, any>
  expression?: string
}

export interface SchemaIndex {
  name: string
  fields: string[]
  unique: boolean
  type: "btree" | "hash" | "gin" | "gist"
}

export interface SchemaConstraint {
  name: string
  type: "unique" | "check" | "foreign_key" | "not_null"
  fields: string[]
  reference?: {
    table: string
    fields: string[]
  }
  condition?: string
}

export interface TransformationPipeline {
  id: string
  name: string
  description?: string
  source: DataSource
  target: DataTarget
  steps: TransformationStep[]
  schedule?: ScheduleConfig
  status: "active" | "inactive" | "running" | "error"
  lastRun?: PipelineRun
  metadata: Record<string, any>
}

export interface DataTarget {
  id: string
  name: string
  type: "database" | "api" | "file" | "stream" | "webhook"
  connection: ConnectionConfig
  schema?: DataSchema
  writeMode: "insert" | "upsert" | "replace" | "append"
  batchSize?: number
  metadata: Record<string, any>
}

export interface TransformationStep {
  id: string
  name: string
  type: "extract" | "transform" | "load" | "validate" | "enrich"
  config: StepConfig
  dependencies?: string[]
  retries?: number
  timeout?: number
  enabled: boolean
}

export interface StepConfig {
  operation: string
  parameters: Record<string, any>
  inputSchema?: DataSchema
  outputSchema?: DataSchema
  errorHandling?: ErrorHandlingConfig
}

export interface ErrorHandlingConfig {
  strategy: "fail" | "skip" | "retry" | "default"
  maxRetries?: number
  retryDelay?: number
  defaultValue?: any
  logLevel?: "debug" | "info" | "warn" | "error"
}

export interface ScheduleConfig {
  type: "cron" | "interval" | "manual" | "event"
  expression?: string
  interval?: number
  timezone?: string
  enabled: boolean
  nextRun?: string
}

export interface PipelineRun {
  id: string
  pipelineId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  recordsProcessed?: number
  recordsSucceeded?: number
  recordsFailed?: number
  errors?: PipelineError[]
  metrics?: RunMetrics
  logs?: string[]
}

export interface PipelineError {
  step: string
  message: string
  code?: string
  timestamp: string
  data?: any
}

export interface RunMetrics {
  throughput: number
  avgProcessingTime: number
  memoryUsage: number
  cpuUsage: number
  networkIO: number
  diskIO: number
}

export interface DataQualityRule {
  id: string
  name: string
  description?: string
  field: string
  type: "completeness" | "uniqueness" | "validity" | "consistency" | "accuracy"
  condition: string
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
}

export interface DataQualityReport {
  id: string
  pipelineId: string
  runId: string
  timestamp: string
  overallScore: number
  rules: QualityRuleResult[]
  recommendations: string[]
  trends: QualityTrend[]
}

export interface QualityRuleResult {
  ruleId: string
  ruleName: string
  score: number
  passed: boolean
  violationCount: number
  totalRecords: number
  details: QualityViolation[]
}

export interface QualityViolation {
  record: any
  field: string
  value: any
  reason: string
  severity: "low" | "medium" | "high" | "critical"
}

export interface QualityTrend {
  ruleId: string
  ruleName: string
  scores: { timestamp: string; score: number }[]
  trend: "improving" | "stable" | "degrading"
}

export interface DataLineage {
  id: string
  name: string
  nodes: LineageNode[]
  edges: LineageEdge[]
  metadata: LineageMetadata
}

export interface LineageNode {
  id: string
  name: string
  type: "source" | "transformation" | "target" | "intermediate"
  schema?: DataSchema
  metadata: Record<string, any>
  position?: { x: number; y: number }
}

export interface LineageEdge {
  id: string
  source: string
  target: string
  type: "data_flow" | "dependency" | "transformation"
  fields?: FieldMapping[]
  metadata: Record<string, any>
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transformation?: string
  confidence: number
}

export interface LineageMetadata {
  lastUpdated: string
  version: string
  totalNodes: number
  totalEdges: number
  complexity: "low" | "medium" | "high"
}
