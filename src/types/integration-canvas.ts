export interface IntegrationFlow {
  id: string
  tenantId: string
  name: string
  description?: string
  status: "draft" | "active" | "paused" | "error"

  // Canvas Configuration
  canvas: {
    nodes: FlowNode[]
    edges: FlowEdge[]
    viewport: {
      x: number
      y: number
      zoom: number
    }
  }

  // Execution Configuration
  trigger: FlowTrigger
  schedule?: FlowSchedule

  // Metadata
  tags: string[]
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string

  // Execution Stats
  stats: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastRun?: string
    avgExecutionTime: number
    recordsProcessed: number
  }
}

export interface FlowNode {
  id: string
  type: FlowNodeType
  position: { x: number; y: number }
  data: FlowNodeData
  selected?: boolean
  dragging?: boolean
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: "default" | "smoothstep" | "step" | "straight"
  animated?: boolean
  style?: Record<string, any>
  label?: string
}

export type FlowNodeType =
  | "source"
  | "destination"
  | "transformation"
  | "filter"
  | "aggregation"
  | "join"
  | "split"
  | "condition"
  | "webhook"
  | "api_call"
  | "database"
  | "file"
  | "email"
  | "custom"

export interface FlowNodeData {
  label: string
  description?: string
  config: Record<string, any>
  inputs?: FlowNodePort[]
  outputs?: FlowNodePort[]
  errors?: string[]
  status?: "idle" | "running" | "success" | "error"
}

export interface FlowNodePort {
  id: string
  name: string
  type: "data" | "control"
  dataType?: "string" | "number" | "boolean" | "object" | "array" | "any"
  required?: boolean
  description?: string
}

export interface FlowTrigger {
  type: "manual" | "schedule" | "webhook" | "event" | "file_watch"
  config: Record<string, any>
}

export interface FlowSchedule {
  type: "interval" | "cron"
  interval?: number // minutes
  cron?: string
  timezone?: string
  enabled: boolean
}

// Connector Definitions
export interface ConnectorDefinition {
  id: string
  name: string
  category: ConnectorCategory
  description: string
  icon: string
  version: string

  // Authentication
  auth: ConnectorAuth

  // Available Operations
  operations: ConnectorOperation[]

  // Configuration Schema
  configSchema: JSONSchema

  // Metadata
  tags: string[]
  popular: boolean
  verified: boolean
  documentation?: string
}

export type ConnectorCategory =
  | "ecommerce"
  | "accounting"
  | "payment"
  | "crm"
  | "marketing"
  | "database"
  | "file_storage"
  | "communication"
  | "analytics"
  | "social_media"
  | "productivity"
  | "custom"

export interface ConnectorAuth {
  type: "none" | "api_key" | "oauth2" | "basic" | "custom"
  config: Record<string, any>
}

export interface ConnectorOperation {
  id: string
  name: string
  type: "read" | "write" | "delete" | "custom"
  description: string

  // Input/Output Schemas
  inputSchema?: JSONSchema
  outputSchema?: JSONSchema

  // Configuration
  config: Record<string, any>

  // Rate Limiting
  rateLimit?: {
    requests: number
    window: number // seconds
  }
}

// Data Transformation Types
export interface DataTransformation {
  id: string
  name: string
  type: TransformationType
  config: TransformationConfig
  inputSchema?: JSONSchema
  outputSchema?: JSONSchema
}

export type TransformationType =
  | "map_fields"
  | "filter_records"
  | "aggregate"
  | "join"
  | "split"
  | "format"
  | "validate"
  | "enrich"
  | "deduplicate"
  | "sort"
  | "custom_script"

export interface TransformationConfig {
  // Field Mapping
  fieldMappings?: FieldMapping[]

  // Filtering
  filters?: FilterRule[]

  // Aggregation
  aggregations?: AggregationRule[]

  // Joining
  joins?: JoinRule[]

  // Formatting
  formatRules?: FormatRule[]

  // Custom Script
  script?: {
    language: "javascript" | "python"
    code: string
    timeout: number
  }
}

export interface FieldMapping {
  source: string
  target: string
  transformation?: {
    type: "format" | "calculate" | "lookup" | "conditional"
    config: Record<string, any>
  }
  required: boolean
  defaultValue?: any
}

export interface FilterRule {
  field: string
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "regex" | "exists"
  value: any
  logicalOperator?: "AND" | "OR"
}

export interface AggregationRule {
  field: string
  operation: "sum" | "avg" | "min" | "max" | "count" | "distinct_count"
  groupBy?: string[]
  alias?: string
}

export interface JoinRule {
  type: "inner" | "left" | "right" | "full"
  leftKey: string
  rightKey: string
  fields?: string[]
}

export interface FormatRule {
  field: string
  format: {
    type: "date" | "number" | "string" | "currency"
    pattern?: string
    locale?: string
  }
}

// Pre-built Connectors
export interface ShopifyConnector extends ConnectorDefinition {
  operations: [
    {
      id: "get_products"
      name: "Get Products"
      type: "read"
      description: "Retrieve products from Shopify store"
    },
    {
      id: "get_orders"
      name: "Get Orders"
      type: "read"
      description: "Retrieve orders from Shopify store"
    },
    {
      id: "create_product"
      name: "Create Product"
      type: "write"
      description: "Create a new product in Shopify"
    },
  ]
}

export interface StripeConnector extends ConnectorDefinition {
  operations: [
    {
      id: "get_payments"
      name: "Get Payments"
      type: "read"
      description: "Retrieve payment data from Stripe"
    },
    {
      id: "get_customers"
      name: "Get Customers"
      type: "read"
      description: "Retrieve customer data from Stripe"
    },
    {
      id: "create_payment_intent"
      name: "Create Payment Intent"
      type: "write"
      description: "Create a payment intent in Stripe"
    },
  ]
}

export interface QuickBooksConnector extends ConnectorDefinition {
  operations: [
    {
      id: "get_invoices"
      name: "Get Invoices"
      type: "read"
      description: "Retrieve invoices from QuickBooks"
    },
    {
      id: "get_customers"
      name: "Get Customers"
      type: "read"
      description: "Retrieve customers from QuickBooks"
    },
    {
      id: "create_invoice"
      name: "Create Invoice"
      type: "write"
      description: "Create an invoice in QuickBooks"
    },
  ]
}

export interface SalesforceConnector extends ConnectorDefinition {
  operations: [
    {
      id: "get_leads"
      name: "Get Leads"
      type: "read"
      description: "Retrieve leads from Salesforce"
    },
    {
      id: "get_opportunities"
      name: "Get Opportunities"
      type: "read"
      description: "Retrieve opportunities from Salesforce"
    },
    {
      id: "create_lead"
      name: "Create Lead"
      type: "write"
      description: "Create a lead in Salesforce"
    },
  ]
}

// Flow Execution Types
export interface FlowExecution {
  id: string
  flowId: string
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number

  // Execution Context
  trigger: {
    type: string
    data?: any
    timestamp: string
  }

  // Node Executions
  nodeExecutions: NodeExecution[]

  // Results
  recordsProcessed: number
  recordsSuccessful: number
  recordsFailed: number

  // Error Information
  errors?: ExecutionError[]

  // Logs
  logs: ExecutionLog[]
}

export interface NodeExecution {
  nodeId: string
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  startTime?: string
  endTime?: string
  duration?: number
  inputData?: any
  outputData?: any
  error?: string
  metrics?: {
    recordsProcessed: number
    recordsSuccessful: number
    recordsFailed: number
  }
}

export interface ExecutionError {
  nodeId?: string
  message: string
  code?: string
  timestamp: string
  stack?: string
}

export interface ExecutionLog {
  level: "debug" | "info" | "warn" | "error"
  message: string
  timestamp: string
  nodeId?: string
  metadata?: Record<string, any>
}

// JSON Schema type (simplified)
export interface JSONSchema {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object"
  format?: string
  pattern?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  enum?: any[]
  items?: JSONSchema
  properties?: Record<string, JSONSchema>
  required?: string[]
  additionalProperties?: boolean | JSONSchema
  description?: string
  example?: any
}

// Canvas Types
export interface CanvasNode {
  id: string
  type: "api" | "transformation" | "destination" | "condition" | "event"
  position: { x: number; y: number }
  data: Record<string, any>
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: "flow" | "condition"
  label?: string
}

export interface IntegrationCanvas {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  metadata: Record<string, any>
}
