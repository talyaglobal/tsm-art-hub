interface ConnectorDefinition {
  id: string
  name: string
  version: string
  description: string
  category: "database" | "api" | "file" | "messaging" | "analytics" | "crm" | "other"
  icon?: string
  configSchema: {
    type: "object"
    properties: Record<string, any>
    required: string[]
  }
  authTypes: ("none" | "api_key" | "oauth2" | "basic" | "bearer")[]
  capabilities: {
    read: boolean
    write: boolean
    realtime: boolean
    webhook: boolean
    batch: boolean
  }
  endpoints?: {
    test: string
    data: string
    schema: string
    webhook?: string
  }
}

interface ConnectorInstance {
  id: string
  connectorId: string
  name: string
  config: Record<string, any>
  credentials: Record<string, any>
  status: "active" | "inactive" | "error" | "testing"
  lastSync?: Date
  metadata: {
    createdAt: Date
    updatedAt: Date
    tenantId: string
    userId: string
  }
}

interface ConnectorOperation {
  type: "read" | "write" | "test" | "schema"
  parameters: Record<string, any>
  timeout?: number
}

interface ConnectorResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    recordCount?: number
    duration?: number
    nextCursor?: string
  }
}

class ConnectorFramework {
  private static instance: ConnectorFramework
  private connectors: Map<string, ConnectorDefinition> = new Map()
  private instances: Map<string, ConnectorInstance> = new Map()

  static getInstance(): ConnectorFramework {
    if (!ConnectorFramework.instance) {
      ConnectorFramework.instance = new ConnectorFramework()
    }
    return ConnectorFramework.instance
  }

  constructor() {
    this.initializeBuiltInConnectors()
  }

  registerConnector(definition: ConnectorDefinition): void {
    this.validateConnectorDefinition(definition)
    this.connectors.set(definition.id, definition)
  }

  getConnector(id: string): ConnectorDefinition | undefined {
    return this.connectors.get(id)
  }

  listConnectors(category?: string): ConnectorDefinition[] {
    const connectors = Array.from(this.connectors.values())
    return category ? connectors.filter((c) => c.category === category) : connectors
  }

  async createInstance(
    connectorId: string,
    config: {
      name: string
      config: Record<string, any>
      credentials: Record<string, any>
      tenantId: string
      userId: string
    },
  ): Promise<ConnectorInstance> {
    const connector = this.connectors.get(connectorId)
    if (!connector) {
      throw new Error(`Connector ${connectorId} not found`)
    }

    // Validate configuration
    this.validateConfiguration(connector, config.config)

    const instanceId = this.generateInstanceId()
    const instance: ConnectorInstance = {
      id: instanceId,
      connectorId,
      name: config.name,
      config: config.config,
      credentials: config.credentials,
      status: "inactive",
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: config.tenantId,
        userId: config.userId,
      },
    }

    this.instances.set(instanceId, instance)

    // Test connection
    try {
      await this.testConnection(instanceId)
      instance.status = "active"
    } catch (error) {
      instance.status = "error"
    }

    return instance
  }

  async updateInstance(
    instanceId: string,
    updates: Partial<Pick<ConnectorInstance, "name" | "config" | "credentials">>,
  ): Promise<ConnectorInstance> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Connector instance ${instanceId} not found`)
    }

    const connector = this.connectors.get(instance.connectorId)
    if (!connector) {
      throw new Error(`Connector ${instance.connectorId} not found`)
    }

    // Validate new configuration if provided
    if (updates.config) {
      this.validateConfiguration(connector, updates.config)
    }

    const updatedInstance: ConnectorInstance = {
      ...instance,
      ...updates,
      metadata: {
        ...instance.metadata,
        updatedAt: new Date(),
      },
    }

    this.instances.set(instanceId, updatedInstance)

    // Re-test connection if config or credentials changed
    if (updates.config || updates.credentials) {
      try {
        await this.testConnection(instanceId)
        updatedInstance.status = "active"
      } catch (error) {
        updatedInstance.status = "error"
      }
    }

    return updatedInstance
  }

  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Connector instance ${instanceId} not found`)
    }

    // Clean up any resources
    await this.cleanupInstance(instance)

    this.instances.delete(instanceId)
  }

  async executeOperation(instanceId: string, operation: ConnectorOperation): Promise<ConnectorResult> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Connector instance ${instanceId} not found`)
    }

    const connector = this.connectors.get(instance.connectorId)
    if (!connector) {
      throw new Error(`Connector ${instance.connectorId} not found`)
    }

    if (instance.status !== "active") {
      throw new Error(`Connector instance ${instanceId} is not active`)
    }

    const startTime = Date.now()

    try {
      const result = await this.performOperation(instance, connector, operation)
      const duration = Date.now() - startTime

      return {
        ...result,
        metadata: {
          ...result.metadata,
          duration,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: String(error),
        metadata: {
          duration: Date.now() - startTime,
        },
      }
    }
  }

  async testConnection(instanceId: string): Promise<ConnectorResult> {
    return this.executeOperation(instanceId, {
      type: "test",
      parameters: {},
    })
  }

  async readData(
    instanceId: string,
    parameters: {
      table?: string
      query?: string
      limit?: number
      offset?: number
      cursor?: string
    } = {},
  ): Promise<ConnectorResult> {
    return this.executeOperation(instanceId, {
      type: "read",
      parameters,
    })
  }

  async writeData(
    instanceId: string,
    parameters: {
      table?: string
      data: any[]
      operation?: "insert" | "update" | "upsert" | "delete"
    },
  ): Promise<ConnectorResult> {
    return this.executeOperation(instanceId, {
      type: "write",
      parameters,
    })
  }

  async getSchema(instanceId: string): Promise<ConnectorResult> {
    return this.executeOperation(instanceId, {
      type: "schema",
      parameters: {},
    })
  }

  private async performOperation(
    instance: ConnectorInstance,
    connector: ConnectorDefinition,
    operation: ConnectorOperation,
  ): Promise<ConnectorResult> {
    // Route to appropriate handler based on connector type
    switch (connector.category) {
      case "database":
        return this.handleDatabaseOperation(instance, connector, operation)
      case "api":
        return this.handleAPIOperation(instance, connector, operation)
      case "file":
        return this.handleFileOperation(instance, connector, operation)
      default:
        throw new Error(`Operation not supported for connector category: ${connector.category}`)
    }
  }

  private async handleDatabaseOperation(
    instance: ConnectorInstance,
    connector: ConnectorDefinition,
    operation: ConnectorOperation,
  ): Promise<ConnectorResult> {
    const { type, parameters } = operation

    switch (type) {
      case "test":
        // Test database connection
        return { success: true, data: { connected: true } }

      case "read":
        // Execute SELECT query
        const { table, query, limit = 100, offset = 0 } = parameters
        const selectQuery = query || `SELECT * FROM ${table} LIMIT ${limit} OFFSET ${offset}`

        // Mock database query execution
        return {
          success: true,
          data: [
            { id: 1, name: "Sample Record 1" },
            { id: 2, name: "Sample Record 2" },
          ],
          metadata: { recordCount: 2 },
        }

      case "write":
        // Execute INSERT/UPDATE/DELETE
        const { data, operation: writeOp = "insert" } = parameters

        // Mock database write operation
        return {
          success: true,
          data: { affected: data.length },
          metadata: { recordCount: data.length },
        }

      case "schema":
        // Get database schema
        return {
          success: true,
          data: {
            tables: [
              {
                name: "users",
                columns: [
                  { name: "id", type: "integer", nullable: false },
                  { name: "name", type: "varchar", nullable: false },
                  { name: "email", type: "varchar", nullable: true },
                ],
              },
            ],
          },
        }

      default:
        throw new Error(`Unsupported database operation: ${type}`)
    }
  }

  private async handleAPIOperation(
    instance: ConnectorInstance,
    connector: ConnectorDefinition,
    operation: ConnectorOperation,
  ): Promise<ConnectorResult> {
    const { type, parameters } = operation
    const baseUrl = instance.config.baseUrl || instance.config.url

    switch (type) {
      case "test":
        // Test API connection
        const testUrl = connector.endpoints?.test ? `${baseUrl}${connector.endpoints.test}` : `${baseUrl}/health`

        const response = await fetch(testUrl, {
          headers: this.buildHeaders(instance),
        })

        return {
          success: response.ok,
          data: { status: response.status, statusText: response.statusText },
        }

      case "read":
        // Fetch data from API
        const dataUrl = connector.endpoints?.data ? `${baseUrl}${connector.endpoints.data}` : `${baseUrl}/data`

        const dataResponse = await fetch(dataUrl, {
          headers: this.buildHeaders(instance),
        })

        if (!dataResponse.ok) {
          throw new Error(`API request failed: ${dataResponse.statusText}`)
        }

        const data = await dataResponse.json()
        return {
          success: true,
          data: Array.isArray(data) ? data : data.data || [data],
          metadata: { recordCount: Array.isArray(data) ? data.length : 1 },
        }

      case "write":
        // Send data to API
        const writeResponse = await fetch(`${baseUrl}/data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.buildHeaders(instance),
          },
          body: JSON.stringify(parameters.data),
        })

        if (!writeResponse.ok) {
          throw new Error(`API write failed: ${writeResponse.statusText}`)
        }

        const writeResult = await writeResponse.json()
        return {
          success: true,
          data: writeResult,
          metadata: { recordCount: parameters.data.length },
        }

      case "schema":
        // Get API schema
        const schemaUrl = connector.endpoints?.schema ? `${baseUrl}${connector.endpoints.schema}` : `${baseUrl}/schema`

        const schemaResponse = await fetch(schemaUrl, {
          headers: this.buildHeaders(instance),
        })

        if (!schemaResponse.ok) {
          throw new Error(`Schema request failed: ${schemaResponse.statusText}`)
        }

        const schema = await schemaResponse.json()
        return { success: true, data: schema }

      default:
        throw new Error(`Unsupported API operation: ${type}`)
    }
  }

  private async handleFileOperation(
    instance: ConnectorInstance,
    connector: ConnectorDefinition,
    operation: ConnectorOperation,
  ): Promise<ConnectorResult> {
    const { type, parameters } = operation

    switch (type) {
      case "test":
        // Test file system access
        return { success: true, data: { accessible: true } }

      case "read":
        // Read file data
        const { path, format = "json" } = parameters

        // Mock file reading
        return {
          success: true,
          data: [
            { id: 1, name: "File Record 1" },
            { id: 2, name: "File Record 2" },
          ],
          metadata: { recordCount: 2 },
        }

      case "write":
        // Write file data
        const { data, outputPath, outputFormat = "json" } = parameters

        // Mock file writing
        return {
          success: true,
          data: { path: outputPath, recordsWritten: data.length },
          metadata: { recordCount: data.length },
        }

      default:
        throw new Error(`Unsupported file operation: ${type}`)
    }
  }

  private buildHeaders(instance: ConnectorInstance): Record<string, string> {
    const headers: Record<string, string> = {}

    if (instance.credentials) {
      const { type, apiKey, token, username, password } = instance.credentials

      switch (type) {
        case "api_key":
          headers["X-API-Key"] = apiKey
          break
        case "bearer":
          headers["Authorization"] = `Bearer ${token}`
          break
        case "basic":
          const credentials = btoa(`${username}:${password}`)
          headers["Authorization"] = `Basic ${credentials}`
          break
      }
    }

    return headers
  }

  private validateConnectorDefinition(definition: ConnectorDefinition): void {
    if (!definition.id || !definition.name || !definition.version) {
      throw new Error("Connector definition must have id, name, and version")
    }

    if (!definition.configSchema || typeof definition.configSchema !== "object") {
      throw new Error("Connector definition must have a valid configSchema")
    }

    if (!Array.isArray(definition.authTypes) || definition.authTypes.length === 0) {
      throw new Error("Connector definition must specify supported auth types")
    }
  }

  private validateConfiguration(connector: ConnectorDefinition, config: Record<string, any>): void {
    const { configSchema } = connector

    // Basic validation - in production, use a proper JSON schema validator
    if (configSchema.required) {
      for (const requiredField of configSchema.required) {
        if (!(requiredField in config)) {
          throw new Error(`Required configuration field missing: ${requiredField}`)
        }
      }
    }
  }

  private async cleanupInstance(instance: ConnectorInstance): Promise<void> {
    // Clean up any resources associated with the instance
    // This could include closing connections, clearing caches, etc.
  }

  private generateInstanceId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private initializeBuiltInConnectors(): void {
    // Register built-in connectors
    this.registerConnector({
      id: "postgresql",
      name: "PostgreSQL",
      version: "1.0.0",
      description: "Connect to PostgreSQL databases",
      category: "database",
      configSchema: {
        type: "object",
        properties: {
          host: { type: "string" },
          port: { type: "number", default: 5432 },
          database: { type: "string" },
          ssl: { type: "boolean", default: false },
        },
        required: ["host", "database"],
      },
      authTypes: ["basic"],
      capabilities: {
        read: true,
        write: true,
        realtime: false,
        webhook: false,
        batch: true,
      },
    })

    this.registerConnector({
      id: "rest-api",
      name: "REST API",
      version: "1.0.0",
      description: "Connect to REST APIs",
      category: "api",
      configSchema: {
        type: "object",
        properties: {
          baseUrl: { type: "string" },
          timeout: { type: "number", default: 30000 },
        },
        required: ["baseUrl"],
      },
      authTypes: ["none", "api_key", "bearer", "basic"],
      capabilities: {
        read: true,
        write: true,
        realtime: false,
        webhook: true,
        batch: true,
      },
      endpoints: {
        test: "/health",
        data: "/data",
        schema: "/schema",
      },
    })

    this.registerConnector({
      id: "csv-file",
      name: "CSV File",
      version: "1.0.0",
      description: "Read and write CSV files",
      category: "file",
      configSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          delimiter: { type: "string", default: "," },
          hasHeader: { type: "boolean", default: true },
        },
        required: ["path"],
      },
      authTypes: ["none"],
      capabilities: {
        read: true,
        write: true,
        realtime: false,
        webhook: false,
        batch: true,
      },
    })
  }

  // Public methods for external access
  getInstance(id: string): ConnectorInstance | undefined {
    return this.instances.get(id)
  }

  listInstances(tenantId?: string): ConnectorInstance[] {
    const instances = Array.from(this.instances.values())
    return tenantId ? instances.filter((i) => i.metadata.tenantId === tenantId) : instances
  }

  getInstanceStats(instanceId: string): {
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    averageResponseTime: number
    lastOperation?: Date
  } {
    // This would typically query operation logs
    // For now, return mock data
    return {
      totalOperations: 100,
      successfulOperations: 95,
      failedOperations: 5,
      averageResponseTime: 250,
      lastOperation: new Date(),
    }
  }
}

export const connectorFramework = ConnectorFramework.getInstance()
