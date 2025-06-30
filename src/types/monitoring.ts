export interface MonitoringConfig {
  enabled: boolean
  interval: number
  timeout: number
  retries: number
  endpoints: string[]
  alertThresholds: {
    responseTime: number
    errorRate: number
    uptime: number
  }
}

export interface HealthCheckResult {
  service: string
  endpoint: string
  status: "healthy" | "unhealthy" | "degraded"
  responseTime: number
  timestamp: string
  error?: string
  metadata?: Record<string, any>
}

export interface MetricData {
  name: string
  value: number
  unit: string
  timestamp: string
  labels: Record<string, string>
  service: string
}

export interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
  cooldown: number
  actions: AlertAction[]
}

export interface AlertAction {
  type: "email" | "webhook" | "slack" | "sms"
  target: string
  template?: string
  enabled: boolean
}

export interface MonitoringDashboard {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  layout: DashboardLayout
  refreshInterval: number
  timeRange: TimeRange
}

export interface DashboardWidget {
  id: string
  type: "chart" | "metric" | "alert" | "log" | "table"
  title: string
  query: string
  visualization: VisualizationConfig
  position: WidgetPosition
}

export interface VisualizationConfig {
  chartType?: "line" | "bar" | "pie" | "gauge" | "heatmap"
  colors?: string[]
  axes?: AxisConfig[]
  legend?: LegendConfig
}

export interface AxisConfig {
  label: string
  scale: "linear" | "logarithmic"
  min?: number
  max?: number
}

export interface LegendConfig {
  show: boolean
  position: "top" | "bottom" | "left" | "right"
}

export interface WidgetPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface DashboardLayout {
  columns: number
  rows: number
  gap: number
}

export interface TimeRange {
  start: string
  end: string
  relative?: string
}

export interface LogEntry {
  timestamp: string
  level: "debug" | "info" | "warn" | "error" | "fatal"
  message: string
  service: string
  traceId?: string
  spanId?: string
  userId?: string
  metadata: Record<string, any>
}

export interface TraceData {
  traceId: string
  spans: SpanData[]
  duration: number
  startTime: string
  endTime: string
  services: string[]
  status: "success" | "error" | "timeout"
}

export interface SpanData {
  spanId: string
  parentSpanId?: string
  operationName: string
  service: string
  startTime: string
  endTime: string
  duration: number
  tags: Record<string, any>
  logs: LogEvent[]
  status: "ok" | "error" | "timeout"
}

export interface LogEvent {
  timestamp: string
  fields: Record<string, any>
}

export interface ServiceMap {
  services: ServiceNode[]
  connections: ServiceConnection[]
  metadata: ServiceMapMetadata
}

export interface ServiceNode {
  id: string
  name: string
  type: "service" | "database" | "cache" | "queue" | "external"
  status: "healthy" | "unhealthy" | "degraded" | "unknown"
  metrics: ServiceMetrics
  position?: { x: number; y: number }
}

export interface ServiceConnection {
  source: string
  target: string
  type: "http" | "grpc" | "database" | "queue" | "cache"
  metrics: ConnectionMetrics
  status: "active" | "inactive" | "error"
}

export interface ServiceMetrics {
  requestRate: number
  errorRate: number
  responseTime: number
  throughput: number
  availability: number
}

export interface ConnectionMetrics {
  requestCount: number
  errorCount: number
  avgResponseTime: number
  throughput: number
}

export interface ServiceMapMetadata {
  lastUpdated: string
  timeRange: TimeRange
  totalServices: number
  totalConnections: number
}
