import { infrastructureQueries } from "@/lib/database/infrastructure-queries"
import type { InfrastructureInstance, BackupConfiguration, RecoveryPlan, ChaosExperiment } from "@/types/infrastructure"
import { cache } from "@/lib/cache/redis-client"
import { jobQueue } from "@/lib/queue/job-queue"

export class InfrastructureService {
  private cachePrefix = "infrastructure:"
  private cacheTTL = 300000 // 5 minutes

  async getInstances(filters?: {
    type?: string
    status?: string
    region?: string
    zone?: string
  }): Promise<InfrastructureInstance[]> {
    const cacheKey = `${this.cachePrefix}instances:${JSON.stringify(filters || {})}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getInstances(filters)
      },
      { ttl: this.cacheTTL },
    )
  }

  async getHealthyInstances(type?: string): Promise<InfrastructureInstance[]> {
    const filters = {
      status: "healthy",
      ...(type && { type }),
    }

    return this.getInstances(filters)
  }

  async getInstance(id: string): Promise<InfrastructureInstance | null> {
    const cacheKey = `${this.cachePrefix}instance:${id}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getInstance(id)
      },
      { ttl: this.cacheTTL },
    )
  }

  async createInstance(instance: Omit<InfrastructureInstance, "id">): Promise<InfrastructureInstance> {
    const created = await infrastructureQueries.createInstance(instance)

    // Invalidate cache
    await cache.invalidatePattern(`${this.cachePrefix}instances:*`)

    // Schedule health check
    await jobQueue.add("health_check", { instanceId: created.id }, { delay: 30000 })

    return created
  }

  async updateInstance(id: string, updates: Partial<InfrastructureInstance>): Promise<InfrastructureInstance> {
    const updated = await infrastructureQueries.updateInstance(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}instance:${id}`)
    await cache.invalidatePattern(`${this.cachePrefix}instances:*`)

    return updated
  }

  async deleteInstance(id: string): Promise<void> {
    await infrastructureQueries.deleteInstance(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}instance:${id}`)
    await cache.invalidatePattern(`${this.cachePrefix}instances:*`)
  }

  async getInstanceMetrics(instanceId: string, timeRange: { start: string; end: string }) {
    const cacheKey = `${this.cachePrefix}metrics:${instanceId}:${timeRange.start}:${timeRange.end}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getInstanceMetrics(instanceId, timeRange)
      },
      { ttl: 60000 }, // 1 minute cache for metrics
    )
  }

  async recordInstanceMetrics(instanceId: string, metrics: Record<string, any>): Promise<void> {
    await infrastructureQueries.recordInstanceMetrics(instanceId, metrics)

    // Invalidate metrics cache
    await cache.invalidatePattern(`${this.cachePrefix}metrics:${instanceId}:*`)
  }

  async getBackupConfigurations(): Promise<BackupConfiguration[]> {
    const cacheKey = `${this.cachePrefix}backup_configs`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getBackupConfigurations()
      },
      { ttl: this.cacheTTL },
    )
  }

  async getBackupConfiguration(id: string): Promise<BackupConfiguration | null> {
    const cacheKey = `${this.cachePrefix}backup_config:${id}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getBackupConfiguration(id)
      },
      { ttl: this.cacheTTL },
    )
  }

  async createBackupConfiguration(config: Omit<BackupConfiguration, "id">): Promise<BackupConfiguration> {
    const created = await infrastructureQueries.createBackupConfiguration(config)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}backup_configs`)

    // Schedule backup if enabled
    if (created.schedule.enabled) {
      await jobQueue.add("backup", { configId: created.id }, { delay: 0 })
    }

    return created
  }

  async updateBackupConfiguration(id: string, updates: Partial<BackupConfiguration>): Promise<BackupConfiguration> {
    const updated = await infrastructureQueries.updateBackupConfiguration(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}backup_config:${id}`)
    await cache.del(`${this.cachePrefix}backup_configs`)

    return updated
  }

  async deleteBackupConfiguration(id: string): Promise<void> {
    await infrastructureQueries.deleteBackupConfiguration(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}backup_config:${id}`)
    await cache.del(`${this.cachePrefix}backup_configs`)
  }

  async executeBackup(configId: string): Promise<string> {
    const config = await this.getBackupConfiguration(configId)

    if (!config) {
      throw new Error(`Backup configuration ${configId} not found`)
    }

    // Schedule backup job
    const jobId = await jobQueue.add("backup_execution", { configId }, { priority: 5 })

    return jobId
  }

  async getRecoveryPlans(): Promise<RecoveryPlan[]> {
    const cacheKey = `${this.cachePrefix}recovery_plans`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getRecoveryPlans()
      },
      { ttl: this.cacheTTL },
    )
  }

  async getRecoveryPlan(id: string): Promise<RecoveryPlan | null> {
    const cacheKey = `${this.cachePrefix}recovery_plan:${id}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getRecoveryPlan(id)
      },
      { ttl: this.cacheTTL },
    )
  }

  async createRecoveryPlan(plan: Omit<RecoveryPlan, "id">): Promise<RecoveryPlan> {
    const created = await infrastructureQueries.createRecoveryPlan(plan)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}recovery_plans`)

    return created
  }

  async updateRecoveryPlan(id: string, updates: Partial<RecoveryPlan>): Promise<RecoveryPlan> {
    const updated = await infrastructureQueries.updateRecoveryPlan(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}recovery_plan:${id}`)
    await cache.del(`${this.cachePrefix}recovery_plans`)

    return updated
  }

  async deleteRecoveryPlan(id: string): Promise<void> {
    await infrastructureQueries.deleteRecoveryPlan(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}recovery_plan:${id}`)
    await cache.del(`${this.cachePrefix}recovery_plans`)
  }

  async executeRecoveryPlan(planId: string): Promise<string> {
    const plan = await this.getRecoveryPlan(planId)

    if (!plan) {
      throw new Error(`Recovery plan ${planId} not found`)
    }

    // Schedule recovery job with high priority
    const jobId = await jobQueue.add("recovery_execution", { planId }, { priority: 10 })

    return jobId
  }

  async getChaosExperiments(): Promise<ChaosExperiment[]> {
    const cacheKey = `${this.cachePrefix}chaos_experiments`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getChaosExperiments()
      },
      { ttl: this.cacheTTL },
    )
  }

  async getChaosExperiment(id: string): Promise<ChaosExperiment | null> {
    const cacheKey = `${this.cachePrefix}chaos_experiment:${id}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getChaosExperiment(id)
      },
      { ttl: this.cacheTTL },
    )
  }

  async createChaosExperiment(experiment: Omit<ChaosExperiment, "id">): Promise<ChaosExperiment> {
    const created = await infrastructureQueries.createChaosExperiment(experiment)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}chaos_experiments`)

    return created
  }

  async updateChaosExperiment(id: string, updates: Partial<ChaosExperiment>): Promise<ChaosExperiment> {
    const updated = await infrastructureQueries.updateChaosExperiment(id, updates)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}chaos_experiment:${id}`)
    await cache.del(`${this.cachePrefix}chaos_experiments`)

    return updated
  }

  async deleteChaosExperiment(id: string): Promise<void> {
    await infrastructureQueries.deleteChaosExperiment(id)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}chaos_experiment:${id}`)
    await cache.del(`${this.cachePrefix}chaos_experiments`)
  }

  async executeChaosExperiment(experimentId: string): Promise<string> {
    const experiment = await this.getChaosExperiment(experimentId)

    if (!experiment) {
      throw new Error(`Chaos experiment ${experimentId} not found`)
    }

    if (experiment.status !== "draft" && experiment.status !== "scheduled") {
      throw new Error(`Chaos experiment ${experimentId} is not in a valid state for execution`)
    }

    // Schedule chaos experiment job
    const jobId = await jobQueue.add("chaos_execution", { experimentId }, { priority: 3 })

    return jobId
  }

  async getSystemOverview() {
    const cacheKey = `${this.cachePrefix}system_overview`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const [instances, backupConfigs, recoveryPlans, chaosExperiments] = await Promise.all([
          this.getInstances(),
          this.getBackupConfigurations(),
          this.getRecoveryPlans(),
          this.getChaosExperiments(),
        ])

        const healthyInstances = instances.filter((i) => i.status === "healthy")
        const unhealthyInstances = instances.filter((i) => i.status === "unhealthy")
        const degradedInstances = instances.filter((i) => i.status === "degraded")

        const activeBackups = backupConfigs.filter((b) => b.schedule.enabled)
        const activeChaosExperiments = chaosExperiments.filter((e) => e.status === "running")

        return {
          instances: {
            total: instances.length,
            healthy: healthyInstances.length,
            unhealthy: unhealthyInstances.length,
            degraded: degradedInstances.length,
            byType: this.groupByType(instances),
            byRegion: this.groupByRegion(instances),
          },
          backups: {
            total: backupConfigs.length,
            active: activeBackups.length,
            lastRun: this.getLastBackupRun(backupConfigs),
          },
          recovery: {
            plans: recoveryPlans.length,
            lastTested: this.getLastRecoveryTest(recoveryPlans),
          },
          chaos: {
            experiments: chaosExperiments.length,
            active: activeChaosExperiments.length,
            lastRun: this.getLastChaosRun(chaosExperiments),
          },
        }
      },
      { ttl: 60000 }, // 1 minute cache for overview
    )
  }

  private groupByType(instances: InfrastructureInstance[]) {
    return instances.reduce(
      (acc, instance) => {
        acc[instance.type] = (acc[instance.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private groupByRegion(instances: InfrastructureInstance[]) {
    return instances.reduce(
      (acc, instance) => {
        acc[instance.region] = (acc[instance.region] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private getLastBackupRun(configs: BackupConfiguration[]): string | null {
    const lastRuns = configs
      .map((c) => c.metadata.lastRun)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())

    return lastRuns[0] || null
  }

  private getLastRecoveryTest(plans: RecoveryPlan[]): string | null {
    const lastTests = plans
      .map((p) => p.metadata.lastTested)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())

    return lastTests[0] || null
  }

  private getLastChaosRun(experiments: ChaosExperiment[]): string | null {
    const lastRuns = experiments
      .map((e) => e.metadata.lastRun)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())

    return lastRuns[0] || null
  }

  async getCapacityPlans() {
    const cacheKey = `${this.cachePrefix}capacity_plans`

    return cache.getOrSet(
      cacheKey,
      async () => {
        return infrastructureQueries.getCapacityPlans()
      },
      { ttl: this.cacheTTL },
    )
  }

  async createCapacityPlan(plan: any) {
    const created = await infrastructureQueries.createCapacityPlan(plan)

    // Invalidate cache
    await cache.del(`${this.cachePrefix}capacity_plans`)

    return created
  }
}

export const infrastructureService = new InfrastructureService()
