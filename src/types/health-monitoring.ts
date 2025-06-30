export interface HealthMonitoringConfig {
  enabled: boolean
  interval: number
  timeout: number
  retries: number
  alerting: {
    enabled: boolean
    channels: string[]
    thresholds: AlertThresholds
  }
  retention: {
    metrics: number
    logs: number
    traces: number
  }
}

export interface AlertThresholds {
  responseTime: {
    warning: number
    critical: number
  }
  errorRate: {
    warning: number
    critical: number
  }
  availability: {
    warning: number
    critical: number
  }
  resourceUsage: {
    cpu: {
      warning: number
      critical: number
    }
    memory: {
      warning: number
      critical: number
    }
    disk: {
      warning: number
      critical: number
    }
  }
}

export interface ServiceHealth {
  id: string
  name: string
  type: "api" | "database" | "cache" | "queue" | "worker" | "external"
  status: "healthy" | "degraded" | "unhealthy" | "unknown"
  lastCheck: string
  nextCheck: string
  endpoint?: string
  checks: HealthCheck[]
  metrics: ServiceHealthMetrics
  dependencies: ServiceDependency[]
  alerts: ServiceAlert[]
  metadata: {
    version: string
    region: string
    environment: string
    tags: Record<string, string>
  }
}

export interface HealthCheck {
  id: string
  name: string
  type: "http" | "tcp" | "database" | "custom"
  status: "passing" | "failing" | "unknown"
  output: string
  duration: number
  timestamp: string
  attempt: number
  config: HealthCheckConfig
}

export interface HealthCheckConfig {
  endpoint?: string
  method?: string
  headers?: Record<string, string>
  body?: string
  expectedStatus?: number[]
  expectedBody?: string
  timeout: number
  interval: number
  retries: number
  retryDelay: number
}

export interface ServiceHealthMetrics {
  uptime: number
  availability: number
  responseTime: {
    current: number
    average: number
    p50: number
    p95: number
    p99: number
  }
  errorRate: {
    current: number
    average: number
    total: number
  }
  throughput: {
    current: number
    average: number
    peak: number
  }
  resources: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}

export interface ServiceDependency {
  id: string
  name: string
  type: "hard" | "soft"
  status: "healthy" | "degraded" | "unhealthy"
  impact: "none" | "low" | "medium" | "high" | "critical"
  lastCheck: string
}

export interface ServiceAlert {
  id: string
  type: "availability" | "performance" | "error" | "resource" | "dependency"
  severity: "info" | "warning" | "error" | "critical"
  status: "active" | "resolved" | "suppressed"
  title: string
  description: string
  timestamp: string
  resolvedAt?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  metadata: Record<string, any>
}

export interface HealthReport {
  id: string
  timestamp: string
  timeRange: {
    start: string
    end: string
  }
  summary: HealthSummary
  services: ServiceHealthReport[]
  incidents: IncidentReport[]
  trends: HealthTrend[]
  recommendations: HealthRecommendation[]
  metadata: {
    generatedBy: string
    version: string
    duration: number
  }
}

export interface HealthSummary {
  totalServices: number
  healthyServices: number
  degradedServices: number
  unhealthyServices: number
  unknownServices: number
  overallStatus: "healthy" | "degraded" | "unhealthy"
  availability: number
  averageResponseTime: number
  totalAlerts: number
  criticalAlerts: number
  activeIncidents: number
}

export interface ServiceHealthReport {
  serviceId: string
  serviceName: string
  status: "healthy" | "degraded" | "unhealthy" | "unknown"
  availability: number
  uptime: number
  incidents: number
  alerts: number
  performanceScore: number
  trends: {
    availability: "improving" | "stable" | "degrading"
    performance: "improving" | "stable" | "degrading"
    reliability: "improving" | "stable" | "degrading"
  }
}

export interface IncidentReport {
  id: string
  title: string
  status: "investigating" | "identified" | "monitoring" | "resolved"
  severity: "minor" | "major" | "critical"
  startTime: string
  endTime?: string
  duration?: number
  affectedServices: string[]
  impact: IncidentImpact
  timeline: IncidentTimelineEntry[]
  rootCause?: string
  resolution?: string
  postmortem?: string
}

export interface IncidentImpact {
  users: {
    affected: number
    percentage: number
  }
  services: {
    affected: number
    degraded: number
    unavailable: number
  }
  business: {
    revenue: number
    transactions: number
    reputation: "low" | "medium" | "high"
  }
}

export interface IncidentTimelineEntry {
  timestamp: string
  type: "detected" | "investigating" | "identified" | "mitigated" | "resolved" | "update"
  title: string
  description: string
  author: string
}

export interface HealthTrend {
  metric: string
  service?: string
  timeframe: "1h" | "1d" | "1w" | "1m"
  direction: "up" | "down" | "stable"
  change: number
  significance: "low" | "medium" | "high"
  data: TrendDataPoint[]
}

export interface TrendDataPoint {
  timestamp: string
  value: number
  baseline?: number
}

export interface HealthRecommendation {
  id: string
  type: "performance" | "reliability" | "cost" | "security" | "monitoring"
  priority: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  impact: string
  effort: "low" | "medium" | "high"
  timeline: string
  actions: RecommendationAction[]
  metrics: string[]
}

export interface RecommendationAction {
  title: string
  description: string
  type: "configuration" | "scaling" | "optimization" | "monitoring"
  automated: boolean
  command?: string
  documentation?: string
}

export interface MonitoringDashboard {
  id: string
  name: string
  description?: string
  type: "overview" | "service" | "infrastructure" | "business"
  layout: DashboardLayout
  widgets: DashboardWidget[]
  filters: DashboardFilter[]
  timeRange: TimeRange
  refreshInterval: number
  permissions: DashboardPermissions
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    version: string
    tags: string[]
  }
}

export interface DashboardLayout {
  columns: number
  rows: number
  gap: number
  responsive: boolean
}

export interface DashboardWidget {
  id: string
  type: "metric" | "chart" | "table" | "alert" | "status" | "log" | "custom"
  title: string
  description?: string
  position: WidgetPosition
  size: WidgetSize
  config: WidgetConfig
  dataSource: DataSource
  visualization: VisualizationConfig
  alerts?: WidgetAlert[]
}

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface WidgetConfig {
  refreshInterval?: number
  autoRefresh?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  interactive?: boolean
  exportable?: boolean
  customOptions?: Record<string, any>
}

export interface DataSource {
  type: "metrics" | "logs" | "traces" | "events" | "api"
  query: string
  parameters?: Record<string, any>
  aggregation?: AggregationConfig
  filters?: FilterConfig[]
}

export interface AggregationConfig {
  function: "sum" | "avg" | "min" | "max" | "count" | "rate" | "percentile"
  groupBy?: string[]
  interval?: string
  percentile?: number
}

export interface FilterConfig {
  field: string
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "regex"
  value: any
}

export interface VisualizationConfig {
  type: "line" | "bar" | "pie" | "gauge" | "heatmap" | "table" | "stat" | "text"
  options: VisualizationOptions
}

export interface VisualizationOptions {
  colors?: string[]
  axes?: AxisConfig[]
  legend?: LegendConfig
  tooltip?: TooltipConfig
  animation?: AnimationConfig
  thresholds?: ThresholdConfig[]
}

export interface AxisConfig {
  label: string
  scale: "linear" | "logarithmic" | "time"
  min?: number
  max?: number
  unit?: string
  format?: string
}

export interface LegendConfig {
  show: boolean
  position: "top" | "bottom" | "left" | "right"
  align: "start" | "center" | "end"
}

export interface TooltipConfig {
  show: boolean
  format?: string
  shared?: boolean
}

export interface AnimationConfig {
  enabled: boolean
  duration: number
  easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
}

export interface ThresholdConfig {
  value: number
  color: string
  label?: string
  operator: "gt" | "gte" | "lt" | "lte"
}

export interface WidgetAlert {
  id: string
  condition: AlertCondition
  actions: AlertAction[]
  enabled: boolean
}

export interface AlertCondition {
  metric: string
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "ne"
  value: number
  duration: number
}

export interface AlertAction {
  type: "notification" | "webhook" | "email" | "slack"
  target: string
  template?: string
  enabled: boolean
}

export interface DashboardFilter {
  id: string
  name: string
  type: "select" | "multiselect" | "text" | "date" | "range"
  field: string
  options?: FilterOption[]
  defaultValue?: any
  required?: boolean
}

export interface FilterOption {
  label: string
  value: any
}

export interface TimeRange {
  type: "relative" | "absolute"
  start: string
  end: string
  relative?: RelativeTimeRange
}

export interface RelativeTimeRange {
  amount: number
  unit: "minutes" | "hours" | "days" | "weeks" | "months"
}

export interface DashboardPermissions {
  view: string[]
  edit: string[]
  admin: string[]
  public: boolean
}

export interface AlertRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  query: string
  condition: AlertRuleCondition
  frequency: number
  timeout: number
  severity: "info" | "warning" | "error" | "critical"
  labels: Record<string, string>
  annotations: Record<string, string>
  actions: AlertRuleAction[]
  silences: AlertSilence[]
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    version: string
  }
}

export interface AlertRuleCondition {
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "ne"
  threshold: number
  duration: number
  aggregation?: AggregationConfig
}

export interface AlertRuleAction {
  type: "notification" | "webhook" | "email" | "slack" | "pagerduty" | "opsgenie"
  target: string
  template?: string
  enabled: boolean
  conditions?: ActionCondition[]
}

export interface ActionCondition {
  field: string
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin"
  value: any
}

export interface AlertSilence {
  id: string
  matcher: SilenceMatcher[]
  startTime: string
  endTime: string
  comment: string
  createdBy: string
}

export interface SilenceMatcher {
  name: string
  value: string
  isRegex: boolean
}
