export interface InfrastructureInstance {
  id: string
  name: string
  type: "api" | "database" | "cache" | "queue" | "worker" | "proxy"
  status: "healthy" | "unhealthy" | "degraded" | "unknown"
  region: string
  zone: string
  ipAddress: string
  port: number
  version: string
  startedAt: string
  lastHealthCheck: string
  metadata: Record<string, any>
  resources: {
    cpu: ResourceMetrics
    memory: ResourceMetrics
    disk: ResourceMetrics
    network: NetworkMetrics
  }
  configuration: InstanceConfiguration
}

export interface ResourceMetrics {
  used: number
  total: number
  percentage: number
  limit?: number
}

export interface NetworkMetrics {
  bytesIn: number
  bytesOut: number
  packetsIn: number
  packetsOut: number
  connections: number
}

export interface InstanceConfiguration {
  replicas: number
  autoScaling: {
    enabled: boolean
    minReplicas: number
    maxReplicas: number
    targetCPU: number
    targetMemory: number
  }
  healthCheck: {
    enabled: boolean
    path: string
    interval: number
    timeout: number
    retries: number
  }
  resources: {
    requests: {
      cpu: string
      memory: string
    }
    limits: {
      cpu: string
      memory: string
    }
  }
}

export interface BackupConfiguration {
  id: string
  name: string
  description?: string
  type: "full" | "incremental" | "differential"
  schedule: {
    enabled: boolean
    cron: string
    timezone: string
  }
  retention: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  storage: {
    provider: "s3" | "gcs" | "azure" | "local"
    bucket: string
    path: string
    encryption: boolean
    compression: boolean
  }
  targets: BackupTarget[]
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    channels: string[]
  }
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    lastRun?: string
    nextRun?: string
  }
}

export interface BackupTarget {
  id: string
  type: "database" | "files" | "configuration"
  source: string
  options: Record<string, any>
}

export interface BackupExecution {
  id: string
  configId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  size?: number
  files?: BackupFile[]
  logs: string[]
  error?: string
  metadata: Record<string, any>
}

export interface BackupFile {
  path: string
  size: number
  checksum: string
  compressed: boolean
  encrypted: boolean
}

export interface RecoveryPlan {
  id: string
  name: string
  description?: string
  type: "disaster" | "point_in_time" | "partial"
  priority: "low" | "medium" | "high" | "critical"
  rto: number // Recovery Time Objective in minutes
  rpo: number // Recovery Point Objective in minutes
  steps: RecoveryStep[]
  dependencies: string[]
  validation: ValidationStep[]
  rollback: RollbackStep[]
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    lastTested?: string
    version: string
  }
}

export interface RecoveryStep {
  id: string
  name: string
  description: string
  type: "manual" | "automated" | "approval"
  order: number
  timeout: number
  command?: string
  script?: string
  parameters: Record<string, any>
  conditions: StepCondition[]
  onSuccess: string[]
  onFailure: string[]
}

export interface ValidationStep {
  id: string
  name: string
  type: "health_check" | "data_integrity" | "performance" | "custom"
  criteria: ValidationCriteria
  timeout: number
}

export interface ValidationCriteria {
  metric: string
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte"
  value: any
  tolerance?: number
}

export interface RollbackStep {
  id: string
  name: string
  description: string
  command?: string
  script?: string
  parameters: Record<string, any>
  conditions: StepCondition[]
}

export interface StepCondition {
  type: "status" | "metric" | "time" | "manual"
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte"
  value: any
  timeout?: number
}

export interface RecoveryExecution {
  id: string
  planId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled" | "rolled_back"
  startTime: string
  endTime?: string
  duration?: number
  currentStep?: string
  completedSteps: string[]
  failedSteps: string[]
  logs: ExecutionLog[]
  error?: string
  rollbackReason?: string
  metadata: Record<string, any>
}

export interface ExecutionLog {
  timestamp: string
  level: "debug" | "info" | "warn" | "error"
  step?: string
  message: string
  data?: Record<string, any>
}

export interface ChaosExperiment {
  id: string
  name: string
  description?: string
  type: "network" | "cpu" | "memory" | "disk" | "service" | "custom"
  status: "draft" | "scheduled" | "running" | "completed" | "failed" | "cancelled"
  targets: ChaosTarget[]
  parameters: ChaosParameters
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  duration: number
  hypothesis: string
  successCriteria: ValidationCriteria[]
  rollbackTriggers: ValidationCriteria[]
  notifications: {
    onStart: boolean
    onComplete: boolean
    onFailure: boolean
    channels: string[]
  }
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    lastRun?: string
    nextRun?: string
  }
}

export interface ChaosTarget {
  type: "instance" | "service" | "region" | "zone"
  selector: Record<string, string>
  percentage?: number
  count?: number
}

export interface ChaosParameters {
  intensity: number
  rampUp?: number
  rampDown?: number
  steadyState?: number
  customParams?: Record<string, any>
}

export interface ChaosExecution {
  id: string
  experimentId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  affectedTargets: string[]
  metrics: ChaosMetrics
  observations: ChaosObservation[]
  logs: ExecutionLog[]
  error?: string
  metadata: Record<string, any>
}

export interface ChaosMetrics {
  baseline: Record<string, number>
  during: Record<string, number>
  recovery: Record<string, number>
  impact: Record<string, number>
}

export interface ChaosObservation {
  timestamp: string
  metric: string
  value: number
  expected: number
  deviation: number
  status: "normal" | "degraded" | "critical"
}

export interface CapacityPlan {
  id: string
  service: string
  region: string
  timeframe: "1h" | "1d" | "1w" | "1m" | "3m" | "6m" | "1y"
  currentCapacity: CapacityMetrics
  projectedCapacity: CapacityMetrics
  recommendations: CapacityRecommendation[]
  assumptions: string[]
  risks: CapacityRisk[]
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    version: string
  }
}

export interface CapacityMetrics {
  cpu: {
    current: number
    projected: number
    utilization: number
    headroom: number
  }
  memory: {
    current: number
    projected: number
    utilization: number
    headroom: number
  }
  storage: {
    current: number
    projected: number
    utilization: number
    headroom: number
  }
  network: {
    bandwidth: number
    utilization: number
    headroom: number
  }
  instances: {
    current: number
    projected: number
    utilization: number
  }
}

export interface CapacityRecommendation {
  type: "scale_up" | "scale_down" | "optimize" | "migrate"
  priority: "low" | "medium" | "high" | "critical"
  description: string
  impact: string
  effort: "low" | "medium" | "high"
  timeline: string
  cost: {
    current: number
    projected: number
    savings: number
  }
  implementation: string[]
}

export interface CapacityRisk {
  type: "performance" | "availability" | "cost" | "security"
  severity: "low" | "medium" | "high" | "critical"
  probability: number
  description: string
  impact: string
  mitigation: string[]
}

export interface LoadBalancer {
  id: string
  name: string
  type: "application" | "network" | "gateway"
  status: "active" | "inactive" | "error"
  algorithm: "round_robin" | "least_connections" | "ip_hash" | "weighted"
  healthCheck: {
    enabled: boolean
    path: string
    interval: number
    timeout: number
    healthyThreshold: number
    unhealthyThreshold: number
  }
  targets: LoadBalancerTarget[]
  listeners: LoadBalancerListener[]
  rules: LoadBalancerRule[]
  ssl: {
    enabled: boolean
    certificate: string
    protocols: string[]
    ciphers: string[]
  }
  metrics: LoadBalancerMetrics
  metadata: {
    createdAt: string
    updatedAt: string
    region: string
    zone: string
  }
}

export interface LoadBalancerTarget {
  id: string
  address: string
  port: number
  weight: number
  status: "healthy" | "unhealthy" | "draining"
  healthCheck: {
    status: "passing" | "failing"
    lastCheck: string
    consecutiveFailures: number
  }
}

export interface LoadBalancerListener {
  port: number
  protocol: "http" | "https" | "tcp" | "udp"
  defaultAction: "forward" | "redirect" | "fixed_response"
  rules: string[]
}

export interface LoadBalancerRule {
  id: string
  priority: number
  conditions: RuleCondition[]
  actions: RuleAction[]
  enabled: boolean
}

export interface RuleCondition {
  type: "path" | "host" | "header" | "query" | "method"
  operator: "equals" | "starts_with" | "contains" | "regex"
  value: string
}

export interface RuleAction {
  type: "forward" | "redirect" | "fixed_response" | "authenticate"
  target?: string
  statusCode?: number
  body?: string
  headers?: Record<string, string>
}

export interface LoadBalancerMetrics {
  requests: {
    total: number
    successful: number
    failed: number
    rate: number
  }
  latency: {
    p50: number
    p95: number
    p99: number
    average: number
  }
  targets: {
    healthy: number
    unhealthy: number
    total: number
  }
  bandwidth: {
    in: number
    out: number
  }
}
