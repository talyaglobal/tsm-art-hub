import { EventEmitter } from "events"

interface Job {
  id: string
  type: string
  data: any
  options: JobOptions
  status: "pending" | "active" | "completed" | "failed" | "delayed"
  attempts: number
  maxAttempts: number
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
  failedAt?: Date
  error?: string
  result?: any
}

interface JobOptions {
  priority?: number
  delay?: number
  attempts?: number
  backoff?: {
    type: "fixed" | "exponential"
    delay: number
  }
  removeOnComplete?: number
  removeOnFail?: number
}

interface QueueStats {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  total: number
  isRunning: boolean
  workers: number
}

type JobProcessor = (job: Job) => Promise<any>

class JobQueue extends EventEmitter {
  private jobs: Map<string, Job> = new Map()
  private processors: Map<string, JobProcessor> = new Map()
  private isRunning = false
  private workers = 0
  private maxWorkers = 5
  private processingInterval: NodeJS.Timeout | null = null
  private stats = {
    processed: 0,
    failed: 0,
    completed: 0,
  }

  constructor() {
    super()
    this.setupDefaultProcessors()
  }

  private setupDefaultProcessors(): void {
    // Health check processor
    this.process("health_check", async (job) => {
      const { serviceId } = job.data
      console.log(`Processing health check for service: ${serviceId}`)

      // Simulate health check processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return { serviceId, status: "completed", timestamp: new Date().toISOString() }
    })

    // Backup processor
    this.process("backup", async (job) => {
      const { configId } = job.data
      console.log(`Processing backup for config: ${configId}`)

      // Simulate backup processing
      await new Promise((resolve) => setTimeout(resolve, 5000))

      return { configId, status: "completed", timestamp: new Date().toISOString() }
    })

    // Backup execution processor
    this.process("backup_execution", async (job) => {
      const { configId } = job.data
      console.log(`Executing backup for config: ${configId}`)

      // Simulate backup execution
      await new Promise((resolve) => setTimeout(resolve, 10000))

      return { configId, status: "completed", size: 1024 * 1024 * 100 } // 100MB
    })

    // Recovery execution processor
    this.process("recovery_execution", async (job) => {
      const { planId } = job.data
      console.log(`Executing recovery plan: ${planId}`)

      // Simulate recovery execution
      await new Promise((resolve) => setTimeout(resolve, 15000))

      return { planId, status: "completed", timestamp: new Date().toISOString() }
    })

    // Chaos execution processor
    this.process("chaos_execution", async (job) => {
      const { experimentId } = job.data
      console.log(`Executing chaos experiment: ${experimentId}`)

      // Simulate chaos experiment
      await new Promise((resolve) => setTimeout(resolve, 8000))

      return { experimentId, status: "completed", impact: "minimal" }
    })

    // Alert notification processor
    this.process("alert_notification", async (job) => {
      const { alertId } = job.data
      console.log(`Sending alert notification: ${alertId}`)

      // Simulate notification sending
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return { alertId, status: "sent", timestamp: new Date().toISOString() }
    })
  }

  async add(type: string, data: any, options: JobOptions = {}): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const job: Job = {
      id: jobId,
      type,
      data,
      options,
      status: options.delay ? "delayed" : "pending",
      attempts: 0,
      maxAttempts: options.attempts || 3,
      createdAt: new Date(),
    }

    this.jobs.set(jobId, job)

    if (options.delay) {
      setTimeout(() => {
        const delayedJob = this.jobs.get(jobId)
        if (delayedJob && delayedJob.status === "delayed") {
          delayedJob.status = "pending"
          this.jobs.set(jobId, delayedJob)
        }
      }, options.delay)
    }

    this.emit("job:added", job)

    if (!this.isRunning) {
      this.start()
    }

    return jobId
  }

  process(type: string, processor: JobProcessor): void {
    this.processors.set(type, processor)
  }

  start(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.processingInterval = setInterval(() => {
      this.processJobs()
    }, 1000)

    this.emit("queue:started")
  }

  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    this.emit("queue:stopped")
  }

  private async processJobs(): Promise<void> {
    if (this.workers >= this.maxWorkers) {
      return
    }

    const pendingJobs = Array.from(this.jobs.values())
      .filter((job) => job.status === "pending")
      .sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0))

    for (const job of pendingJobs) {
      if (this.workers >= this.maxWorkers) {
        break
      }

      const processor = this.processors.get(job.type)
      if (!processor) {
        console.warn(`No processor found for job type: ${job.type}`)
        job.status = "failed"
        job.error = `No processor found for job type: ${job.type}`
        job.failedAt = new Date()
        this.jobs.set(job.id, job)
        this.stats.failed++
        this.emit("job:failed", job)
        continue
      }

      this.processJob(job, processor)
    }
  }

  private async processJob(job: Job, processor: JobProcessor): Promise<void> {
    this.workers++
    job.status = "active"
    job.processedAt = new Date()
    job.attempts++
    this.jobs.set(job.id, job)

    this.emit("job:active", job)

    try {
      const result = await processor(job)

      job.status = "completed"
      job.completedAt = new Date()
      job.result = result
      this.jobs.set(job.id, job)

      this.stats.completed++
      this.stats.processed++
      this.emit("job:completed", job)

      // Remove completed jobs if configured
      if (job.options.removeOnComplete) {
        setTimeout(() => {
          this.jobs.delete(job.id)
        }, job.options.removeOnComplete)
      }
    } catch (error) {
      job.error = error instanceof Error ? error.message : "Unknown error"

      if (job.attempts < job.maxAttempts) {
        // Retry with backoff
        const delay = this.calculateBackoffDelay(job)
        job.status = "delayed"

        setTimeout(() => {
          const retryJob = this.jobs.get(job.id)
          if (retryJob && retryJob.status === "delayed") {
            retryJob.status = "pending"
            this.jobs.set(job.id, retryJob)
          }
        }, delay)

        this.emit("job:retry", job)
      } else {
        job.status = "failed"
        job.failedAt = new Date()
        this.stats.failed++
        this.stats.processed++
        this.emit("job:failed", job)

        // Remove failed jobs if configured
        if (job.options.removeOnFail) {
          setTimeout(() => {
            this.jobs.delete(job.id)
          }, job.options.removeOnFail)
        }
      }

      this.jobs.set(job.id, job)
    } finally {
      this.workers--
    }
  }

  private calculateBackoffDelay(job: Job): number {
    const backoff = job.options.backoff || { type: "exponential", delay: 1000 }

    if (backoff.type === "exponential") {
      return backoff.delay * Math.pow(2, job.attempts - 1)
    } else {
      return backoff.delay
    }
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id)
  }

  getJobs(status?: Job["status"]): Job[] {
    const jobs = Array.from(this.jobs.values())

    if (status) {
      return jobs.filter((job) => job.status === status)
    }

    return jobs
  }

  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values())

    return {
      waiting: jobs.filter((job) => job.status === "pending").length,
      active: jobs.filter((job) => job.status === "active").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      delayed: jobs.filter((job) => job.status === "delayed").length,
      total: jobs.length,
      isRunning: this.isRunning,
      workers: this.workers,
    }
  }

  async removeJob(id: string): Promise<boolean> {
    const job = this.jobs.get(id)

    if (!job) {
      return false
    }

    if (job.status === "active") {
      return false // Cannot remove active jobs
    }

    this.jobs.delete(id)
    this.emit("job:removed", job)
    return true
  }

  async clean(grace = 0, status?: Job["status"]): Promise<number> {
    const cutoff = new Date(Date.now() - grace)
    let removed = 0

    for (const [id, job] of this.jobs.entries()) {
      if (status && job.status !== status) {
        continue
      }

      if (job.status === "active") {
        continue // Don't remove active jobs
      }

      const jobDate = job.completedAt || job.failedAt || job.createdAt
      if (jobDate < cutoff) {
        this.jobs.delete(id)
        removed++
      }
    }

    return removed
  }

  async pause(): Promise<void> {
    this.stop()
    this.emit("queue:paused")
  }

  async resume(): Promise<void> {
    this.start()
    this.emit("queue:resumed")
  }

  async empty(): Promise<void> {
    const pendingJobs = Array.from(this.jobs.values()).filter(
      (job) => job.status === "pending" || job.status === "delayed",
    )

    for (const job of pendingJobs) {
      this.jobs.delete(job.id)
    }

    this.emit("queue:emptied")
  }
}

export const jobQueue = new JobQueue()

export default jobQueue
