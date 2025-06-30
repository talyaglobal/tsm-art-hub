interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

interface ValidationError {
  field: string
  message: string
  code: string
}

interface SchemaField {
  type: "string" | "number" | "boolean" | "array" | "object" | "email" | "url" | "uuid"
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  enum?: any[]
  custom?: (value: any) => boolean | string
}

interface Schema {
  [key: string]: SchemaField
}

class Validator {
  validate<T = any>(data: any, schema: Schema): ValidationResult<T> {
    const errors: ValidationError[] = []
    const result: any = {}

    // Check required fields
    for (const [field, config] of Object.entries(schema)) {
      if (config.required && (data[field] === undefined || data[field] === null)) {
        errors.push({
          field,
          message: `${field} is required`,
          code: "REQUIRED",
        })
        continue
      }

      if (data[field] !== undefined && data[field] !== null) {
        const fieldErrors = this.validateField(field, data[field], config)
        errors.push(...fieldErrors)

        if (fieldErrors.length === 0) {
          result[field] = data[field]
        }
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? result : undefined,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  private validateField(field: string, value: any, config: SchemaField): ValidationError[] {
    const errors: ValidationError[] = []

    // Type validation
    if (!this.validateType(value, config.type)) {
      errors.push({
        field,
        message: `${field} must be of type ${config.type}`,
        code: "INVALID_TYPE",
      })
      return errors
    }

    // String validations
    if (config.type === "string" && typeof value === "string") {
      if (config.min && value.length < config.min) {
        errors.push({
          field,
          message: `${field} must be at least ${config.min} characters`,
          code: "MIN_LENGTH",
        })
      }

      if (config.max && value.length > config.max) {
        errors.push({
          field,
          message: `${field} must be at most ${config.max} characters`,
          code: "MAX_LENGTH",
        })
      }

      if (config.pattern && !config.pattern.test(value)) {
        errors.push({
          field,
          message: `${field} format is invalid`,
          code: "INVALID_FORMAT",
        })
      }
    }

    // Number validations
    if (config.type === "number" && typeof value === "number") {
      if (config.min && value < config.min) {
        errors.push({
          field,
          message: `${field} must be at least ${config.min}`,
          code: "MIN_VALUE",
        })
      }

      if (config.max && value > config.max) {
        errors.push({
          field,
          message: `${field} must be at most ${config.max}`,
          code: "MAX_VALUE",
        })
      }
    }

    // Array validations
    if (config.type === "array" && Array.isArray(value)) {
      if (config.min && value.length < config.min) {
        errors.push({
          field,
          message: `${field} must have at least ${config.min} items`,
          code: "MIN_ITEMS",
        })
      }

      if (config.max && value.length > config.max) {
        errors.push({
          field,
          message: `${field} must have at most ${config.max} items`,
          code: "MAX_ITEMS",
        })
      }
    }

    // Enum validation
    if (config.enum && !config.enum.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${config.enum.join(", ")}`,
        code: "INVALID_ENUM",
      })
    }

    // Custom validation
    if (config.custom) {
      const customResult = config.custom(value)
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === "string" ? customResult : `${field} is invalid`,
          code: "CUSTOM_VALIDATION",
        })
      }
    }

    return errors
  }

  private validateType(value: any, type: SchemaField["type"]): boolean {
    switch (type) {
      case "string":
        return typeof value === "string"
      case "number":
        return typeof value === "number" && !isNaN(value)
      case "boolean":
        return typeof value === "boolean"
      case "array":
        return Array.isArray(value)
      case "object":
        return typeof value === "object" && value !== null && !Array.isArray(value)
      case "email":
        return typeof value === "string" && this.isValidEmail(value)
      case "url":
        return typeof value === "string" && this.isValidUrl(value)
      case "uuid":
        return typeof value === "string" && this.isValidUuid(value)
      default:
        return true
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}

export const validator = new Validator()

// Common schemas
export const userSchema: Schema = {
  email: { type: "email", required: true },
  password: { type: "string", required: true, min: 8 },
  name: { type: "string", required: true, min: 2, max: 100 },
  role: { type: "string", enum: ["user", "admin", "moderator"] },
}

export const apiKeySchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  permissions: { type: "array", required: true },
  expiresAt: { type: "string" },
}

export const integrationSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  type: { type: "string", required: true, enum: ["webhook", "api", "database", "queue"] },
  config: { type: "object", required: true },
  enabled: { type: "boolean" },
}

export const pipelineSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  description: { type: "string", max: 500 },
  steps: { type: "array", required: true, min: 1 },
  enabled: { type: "boolean" },
}

export const alertRuleSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  query: { type: "string", required: true },
  threshold: { type: "number", required: true },
  severity: { type: "string", required: true, enum: ["info", "warning", "error", "critical"] },
  enabled: { type: "boolean" },
}

export const backupConfigSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  type: { type: "string", required: true, enum: ["full", "incremental", "differential"] },
  schedule: { type: "object", required: true },
  retention: { type: "object", required: true },
  targets: { type: "array", required: true, min: 1 },
}

export const recoveryPlanSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  description: { type: "string", max: 500 },
  type: { type: "string", required: true, enum: ["disaster", "point_in_time", "partial"] },
  priority: { type: "string", required: true, enum: ["low", "medium", "high", "critical"] },
  rto: { type: "number", required: true, min: 0 },
  rpo: { type: "number", required: true, min: 0 },
  steps: { type: "array", required: true, min: 1 },
}

export const chaosExperimentSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  description: { type: "string", max: 500 },
  type: { type: "string", required: true, enum: ["network", "cpu", "memory", "disk", "service", "custom"] },
  targets: { type: "array", required: true, min: 1 },
  duration: { type: "number", required: true, min: 1 },
  hypothesis: { type: "string", required: true },
}

export const serviceHealthSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  type: { type: "string", required: true, enum: ["api", "database", "cache", "queue", "worker", "external"] },
  endpoint: { type: "url" },
  checks: { type: "array", required: true },
}

export const dashboardSchema: Schema = {
  name: { type: "string", required: true, min: 1, max: 100 },
  description: { type: "string", max: 500 },
  type: { type: "string", required: true, enum: ["overview", "service", "infrastructure", "business"] },
  widgets: { type: "array", required: true },
  layout: { type: "object", required: true },
}

// Validation helper functions
export function validateUser(data: any): ValidationResult<any> {
  return validator.validate(data, userSchema)
}

export function validateApiKey(data: any): ValidationResult<any> {
  return validator.validate(data, apiKeySchema)
}

export function validateIntegration(data: any): ValidationResult<any> {
  return validator.validate(data, integrationSchema)
}

export function validatePipeline(data: any): ValidationResult<any> {
  return validator.validate(data, pipelineSchema)
}

export function validateAlertRule(data: any): ValidationResult<any> {
  return validator.validate(data, alertRuleSchema)
}

export function validateBackupConfig(data: any): ValidationResult<any> {
  return validator.validate(data, backupConfigSchema)
}

export function validateRecoveryPlan(data: any): ValidationResult<any> {
  return validator.validate(data, recoveryPlanSchema)
}

export function validateChaosExperiment(data: any): ValidationResult<any> {
  return validator.validate(data, chaosExperimentSchema)
}

export function validateServiceHealth(data: any): ValidationResult<any> {
  return validator.validate(data, serviceHealthSchema)
}

export function validateDashboard(data: any): ValidationResult<any> {
  return validator.validate(data, dashboardSchema)
}

export function validateRequestBody<T = any>(data: any, schema: Schema): ValidationResult<T> {
  return validator.validate<T>(data, schema)
}

export function createCustomValidator(schema: Schema) {
  return (data: any) => validator.validate(data, schema)
}
