import { createClient, type RedisClientType } from "redis"
import { config } from "@/lib/config/environment"

interface CacheOptions {
  ttl?: number
  prefix?: string
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  connected: boolean
  uptime: number
}

class RedisCache {
  private client: RedisClientType | null = null
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    connected: false,
    uptime: 0,
  }
  private startTime: number = Date.now()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.connect()
  }

  private async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries >= this.maxReconnectAttempts) {
              console.error("Redis: Max reconnection attempts reached")
              return false
            }
            return Math.min(retries * this.reconnectDelay, 3000)
          },
        },
      })

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err)
        this.stats.errors++
        this.stats.connected = false
      })

      this.client.on("connect", () => {
        console.log("Redis Client Connected")
        this.stats.connected = true
        this.reconnectAttempts = 0
      })

      this.client.on("disconnect", () => {
        console.log("Redis Client Disconnected")
        this.stats.connected = false
      })

      await this.client.connect()
    } catch (error) {
      console.error("Failed to connect to Redis:", error)
      this.stats.errors++
      this.stats.connected = false
    }
  }

  private getKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || config.redis.keyPrefix
    return `${keyPrefix}${key}`
  }

  async get<T = string>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.client || !this.stats.connected) {
      this.stats.misses++
      return null
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const value = await this.client.get(fullKey)

      if (value === null) {
        this.stats.misses++
        return null
      }

      this.stats.hits++

      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    } catch (error) {
      console.error("Redis get error:", error)
      this.stats.errors++
      this.stats.misses++
      return null
    }
  }

  async set(key: string, value: any, ttl?: number, options?: CacheOptions): Promise<boolean> {
    if (!this.client || !this.stats.connected) {
      return false
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const serializedValue = typeof value === "string" ? value : JSON.stringify(value)
      const expiration = ttl || options?.ttl

      if (expiration) {
        await this.client.setEx(fullKey, Math.floor(expiration / 1000), serializedValue)
      } else {
        await this.client.set(fullKey, serializedValue)
      }

      this.stats.sets++
      return true
    } catch (error) {
      console.error("Redis set error:", error)
      this.stats.errors++
      return false
    }
  }

  async del(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.client || !this.stats.connected) {
      return false
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const result = await this.client.del(fullKey)
      this.stats.deletes++
      return result > 0
    } catch (error) {
      console.error("Redis del error:", error)
      this.stats.errors++
      return false
    }
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.client || !this.stats.connected) {
      return false
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const result = await this.client.exists(fullKey)
      return result > 0
    } catch (error) {
      console.error("Redis exists error:", error)
      this.stats.errors++
      return false
    }
  }

  async expire(key: string, ttl: number, options?: CacheOptions): Promise<boolean> {
    if (!this.client || !this.stats.connected) {
      return false
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const result = await this.client.expire(fullKey, Math.floor(ttl / 1000))
      return result
    } catch (error) {
      console.error("Redis expire error:", error)
      this.stats.errors++
      return false
    }
  }

  async invalidatePattern(pattern: string, options?: CacheOptions): Promise<number> {
    if (!this.client || !this.stats.connected) {
      return 0
    }

    try {
      const fullPattern = this.getKey(pattern, options?.prefix)
      const keys = await this.client.keys(fullPattern)

      if (keys.length === 0) {
        return 0
      }

      const result = await this.client.del(keys)
      this.stats.deletes += keys.length
      return result
    } catch (error) {
      console.error("Redis invalidatePattern error:", error)
      this.stats.errors++
      return 0
    }
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions & { ttl?: number }): Promise<T> {
    const cached = await this.get<T>(key, options)

    if (cached !== null) {
      return cached
    }

    try {
      const value = await fetcher()
      await this.set(key, value, options?.ttl, options)
      return value
    } catch (error) {
      console.error("Redis getOrSet fetcher error:", error)
      throw error
    }
  }

  async increment(key: string, amount = 1, options?: CacheOptions): Promise<number> {
    if (!this.client || !this.stats.connected) {
      return 0
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const result = await this.client.incrBy(fullKey, amount)
      return result
    } catch (error) {
      console.error("Redis increment error:", error)
      this.stats.errors++
      return 0
    }
  }

  async decrement(key: string, amount = 1, options?: CacheOptions): Promise<number> {
    if (!this.client || !this.stats.connected) {
      return 0
    }

    try {
      const fullKey = this.getKey(key, options?.prefix)
      const result = await this.client.decrBy(fullKey, amount)
      return result
    } catch (error) {
      console.error("Redis decrement error:", error)
      this.stats.errors++
      return 0
    }
  }

  async flush(): Promise<boolean> {
    if (!this.client || !this.stats.connected) {
      return false
    }

    try {
      await this.client.flushDb()
      return true
    } catch (error) {
      console.error("Redis flush error:", error)
      this.stats.errors++
      return false
    }
  }

  getStats(): CacheStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.startTime,
    }
  }

  async ping(): Promise<boolean> {
    if (!this.client || !this.stats.connected) {
      return false
    }

    try {
      const result = await this.client.ping()
      return result === "PONG"
    } catch (error) {
      console.error("Redis ping error:", error)
      this.stats.errors++
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect()
        this.stats.connected = false
      } catch (error) {
        console.error("Redis disconnect error:", error)
        this.stats.errors++
      }
    }
  }
}

export const cache = new RedisCache()

export default cache
