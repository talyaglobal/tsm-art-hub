import { createClient } from "@/lib/supabase/server"
import type { InfrastructureInstance, BackupConfiguration, RecoveryPlan, ChaosExperiment } from "@/types/infrastructure"

export class InfrastructureQueries {
  private supabase = createClient()

  async getInstances(filters?: {
    type?: string
    status?: string
    region?: string
    zone?: string
  }): Promise<InfrastructureInstance[]> {
    try {
      let query = this.supabase.from("infrastructure_instances").select("*")

      if (filters?.type) {
        query = query.eq("type", filters.type)
      }
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }
      if (filters?.region) {
        query = query.eq("region", filters.region)
      }
      if (filters?.zone) {
        query = query.eq("zone", filters.zone)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch instances: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching instances:", error)
      throw error
    }
  }

  async getInstance(id: string): Promise<InfrastructureInstance | null> {
    try {
      const { data, error } = await this.supabase.from("infrastructure_instances").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch instance: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching instance:", error)
      throw error
    }
  }

  async createInstance(instance: Omit<InfrastructureInstance, "id">): Promise<InfrastructureInstance> {
    try {
      const { data, error } = await this.supabase.from("infrastructure_instances").insert(instance).select().single()

      if (error) {
        throw new Error(`Failed to create instance: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating instance:", error)
      throw error
    }
  }

  async updateInstance(id: string, updates: Partial<InfrastructureInstance>): Promise<InfrastructureInstance> {
    try {
      const { data, error } = await this.supabase
        .from("infrastructure_instances")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update instance: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating instance:", error)
      throw error
    }
  }

  async deleteInstance(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("infrastructure_instances").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete instance: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting instance:", error)
      throw error
    }
  }

  async getBackupConfigurations(): Promise<BackupConfiguration[]> {
    try {
      const { data, error } = await this.supabase
        .from("backup_configurations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch backup configurations: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching backup configurations:", error)
      throw error
    }
  }

  async getBackupConfiguration(id: string): Promise<BackupConfiguration | null> {
    try {
      const { data, error } = await this.supabase.from("backup_configurations").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch backup configuration: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching backup configuration:", error)
      throw error
    }
  }

  async createBackupConfiguration(config: Omit<BackupConfiguration, "id">): Promise<BackupConfiguration> {
    try {
      const { data, error } = await this.supabase.from("backup_configurations").insert(config).select().single()

      if (error) {
        throw new Error(`Failed to create backup configuration: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating backup configuration:", error)
      throw error
    }
  }

  async updateBackupConfiguration(id: string, updates: Partial<BackupConfiguration>): Promise<BackupConfiguration> {
    try {
      const { data, error } = await this.supabase
        .from("backup_configurations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update backup configuration: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating backup configuration:", error)
      throw error
    }
  }

  async deleteBackupConfiguration(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("backup_configurations").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete backup configuration: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting backup configuration:", error)
      throw error
    }
  }

  async getRecoveryPlans(): Promise<RecoveryPlan[]> {
    try {
      const { data, error } = await this.supabase
        .from("recovery_plans")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch recovery plans: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching recovery plans:", error)
      throw error
    }
  }

  async getRecoveryPlan(id: string): Promise<RecoveryPlan | null> {
    try {
      const { data, error } = await this.supabase.from("recovery_plans").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch recovery plan: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching recovery plan:", error)
      throw error
    }
  }

  async createRecoveryPlan(plan: Omit<RecoveryPlan, "id">): Promise<RecoveryPlan> {
    try {
      const { data, error } = await this.supabase.from("recovery_plans").insert(plan).select().single()

      if (error) {
        throw new Error(`Failed to create recovery plan: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating recovery plan:", error)
      throw error
    }
  }

  async updateRecoveryPlan(id: string, updates: Partial<RecoveryPlan>): Promise<RecoveryPlan> {
    try {
      const { data, error } = await this.supabase
        .from("recovery_plans")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update recovery plan: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating recovery plan:", error)
      throw error
    }
  }

  async deleteRecoveryPlan(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("recovery_plans").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete recovery plan: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting recovery plan:", error)
      throw error
    }
  }

  async getChaosExperiments(): Promise<ChaosExperiment[]> {
    try {
      const { data, error } = await this.supabase
        .from("chaos_experiments")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch chaos experiments: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching chaos experiments:", error)
      throw error
    }
  }

  async getChaosExperiment(id: string): Promise<ChaosExperiment | null> {
    try {
      const { data, error } = await this.supabase.from("chaos_experiments").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new Error(`Failed to fetch chaos experiment: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching chaos experiment:", error)
      throw error
    }
  }

  async createChaosExperiment(experiment: Omit<ChaosExperiment, "id">): Promise<ChaosExperiment> {
    try {
      const { data, error } = await this.supabase.from("chaos_experiments").insert(experiment).select().single()

      if (error) {
        throw new Error(`Failed to create chaos experiment: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating chaos experiment:", error)
      throw error
    }
  }

  async updateChaosExperiment(id: string, updates: Partial<ChaosExperiment>): Promise<ChaosExperiment> {
    try {
      const { data, error } = await this.supabase
        .from("chaos_experiments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update chaos experiment: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error updating chaos experiment:", error)
      throw error
    }
  }

  async deleteChaosExperiment(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("chaos_experiments").delete().eq("id", id)

      if (error) {
        throw new Error(`Failed to delete chaos experiment: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting chaos experiment:", error)
      throw error
    }
  }

  async getInstanceMetrics(instanceId: string, timeRange: { start: string; end: string }) {
    try {
      const { data, error } = await this.supabase
        .from("instance_metrics")
        .select("*")
        .eq("instance_id", instanceId)
        .gte("timestamp", timeRange.start)
        .lte("timestamp", timeRange.end)
        .order("timestamp", { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch instance metrics: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching instance metrics:", error)
      throw error
    }
  }

  async recordInstanceMetrics(instanceId: string, metrics: Record<string, any>): Promise<void> {
    try {
      const { error } = await this.supabase.from("instance_metrics").insert({
        instance_id: instanceId,
        timestamp: new Date().toISOString(),
        metrics,
      })

      if (error) {
        throw new Error(`Failed to record instance metrics: ${error.message}`)
      }
    } catch (error) {
      console.error("Error recording instance metrics:", error)
      throw error
    }
  }

  async getCapacityPlans(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("capacity_plans")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch capacity plans: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching capacity plans:", error)
      throw error
    }
  }

  async createCapacityPlan(plan: any): Promise<any> {
    try {
      const { data, error } = await this.supabase.from("capacity_plans").insert(plan).select().single()

      if (error) {
        throw new Error(`Failed to create capacity plan: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error creating capacity plan:", error)
      throw error
    }
  }
}

export const infrastructureQueries = new InfrastructureQueries()
