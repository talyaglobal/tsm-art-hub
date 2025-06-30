interface Policy {
  id: string
  name: string
  description: string
  type: "rate_limit" | "authentication" | "authorization" | "data_validation" | "transformation"
  rules: PolicyRule[]
  enabled: boolean
  priority: number
  conditions?: PolicyCondition[]
}

interface PolicyRule {
  id: string
  condition: string
  action: PolicyAction
  parameters: Record<string, any>
}

interface PolicyAction {
  type: "allow" | "deny" | "transform" | "log" | "redirect"
  parameters: Record<string, any>
}

interface PolicyCondition {
  field: string
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "regex"
  value: any
}

interface PolicyExecutionContext {
  request: {
    method: string
    path: string
    headers: Record<string, string>
    body?: any
    query: Record<string, string>
  }
  user?: {
    id: string
    roles: string[]
    permissions: string[]
  }
  integration?: {
    id: string
    type: string
    config: Record<string, any>
  }
}

interface PolicyExecutionResult {
  allowed: boolean
  transformedRequest?: any
  logs: string[]
  appliedPolicies: string[]
  errors: string[]
}

export class PolicyEngine {
  private policies: Map<string, Policy> = new Map()

  async addPolicy(policy: Policy): Promise<void> {
    this.policies.set(policy.id, policy)
  }

  async removePolicy(policyId: string): Promise<boolean> {
    return this.policies.delete(policyId)
  }

  async updatePolicy(policyId: string, updates: Partial<Policy>): Promise<Policy | null> {
    const policy = this.policies.get(policyId)
    if (!policy) return null

    const updated = { ...policy, ...updates }
    this.policies.set(policyId, updated)
    return updated
  }

  async executePolicy(policyId: string, context: PolicyExecutionContext): Promise<PolicyExecutionResult> {
    const policy = this.policies.get(policyId)
    if (!policy || !policy.enabled) {
      return {
        allowed: true,
        logs: [`Policy ${policyId} not found or disabled`],
        appliedPolicies: [],
        errors: [],
      }
    }

    return this.executeSinglePolicy(policy, context)
  }

  async executePolicies(context: PolicyExecutionContext): Promise<PolicyExecutionResult> {
    const result: PolicyExecutionResult = {
      allowed: true,
      logs: [],
      appliedPolicies: [],
      errors: [],
    }

    // Get applicable policies sorted by priority
    const applicablePolicies = Array.from(this.policies.values())
      .filter((policy) => policy.enabled && this.isPolicyApplicable(policy, context))
      .sort((a, b) => a.priority - b.priority)

    let transformedRequest = context.request

    for (const policy of applicablePolicies) {
      const policyResult = await this.executeSinglePolicy(policy, {
        ...context,
        request: transformedRequest,
      })

      result.logs.push(...policyResult.logs)
      result.appliedPolicies.push(policy.id)
      result.errors.push(...policyResult.errors)

      if (!policyResult.allowed) {
        result.allowed = false
        break
      }

      if (policyResult.transformedRequest) {
        transformedRequest = policyResult.transformedRequest
        result.transformedRequest = transformedRequest
      }
    }

    return result
  }

  private async executeSinglePolicy(policy: Policy, context: PolicyExecutionContext): Promise<PolicyExecutionResult> {
    const result: PolicyExecutionResult = {
      allowed: true,
      logs: [`Executing policy: ${policy.name}`],
      appliedPolicies: [policy.id],
      errors: [],
    }

    try {
      // Check policy conditions
      if (policy.conditions && !this.evaluateConditions(policy.conditions, context)) {
        result.logs.push(`Policy conditions not met for: ${policy.name}`)
        return result
      }

      // Execute policy rules
      for (const rule of policy.rules) {
        const ruleResult = await this.executeRule(rule, context)

        result.logs.push(...ruleResult.logs)
        result.errors.push(...ruleResult.errors)

        if (!ruleResult.allowed) {
          result.allowed = false
          break
        }

        if (ruleResult.transformedRequest) {
          result.transformedRequest = ruleResult.transformedRequest
        }
      }
    } catch (error) {
      result.errors.push(`Error executing policy ${policy.name}: ${error}`)
      result.allowed = false
    }

    return result
  }

  private async executeRule(rule: PolicyRule, context: PolicyExecutionContext): Promise<PolicyExecutionResult> {
    const result: PolicyExecutionResult = {
      allowed: true,
      logs: [`Executing rule: ${rule.id}`],
      appliedPolicies: [],
      errors: [],
    }

    try {
      // Evaluate rule condition
      if (!this.evaluateRuleCondition(rule.condition, context)) {
        result.logs.push(`Rule condition not met: ${rule.condition}`)
        return result
      }

      // Execute rule action
      const actionResult = await this.executeAction(rule.action, context, rule.parameters)

      result.allowed = actionResult.allowed
      result.transformedRequest = actionResult.transformedRequest
      result.logs.push(...actionResult.logs)
      result.errors.push(...actionResult.errors)
    } catch (error) {
      result.errors.push(`Error executing rule ${rule.id}: ${error}`)
      result.allowed = false
    }

    return result
  }

  private async executeAction(
    action: PolicyAction,
    context: PolicyExecutionContext,
    parameters: Record<string, any>,
  ): Promise<PolicyExecutionResult> {
    const result: PolicyExecutionResult = {
      allowed: true,
      logs: [],
      appliedPolicies: [],
      errors: [],
    }

    switch (action.type) {
      case "allow":
        result.logs.push("Action: Allow request")
        break

      case "deny":
        result.allowed = false
        result.logs.push(`Action: Deny request - ${action.parameters.reason || "No reason provided"}`)
        break

      case "transform":
        result.transformedRequest = this.transformRequest(context.request, action.parameters)
        result.logs.push("Action: Transform request")
        break

      case "log":
        result.logs.push(`Action: Log - ${action.parameters.message || "Request logged"}`)
        break

      case "redirect":
        result.allowed = false
        result.logs.push(`Action: Redirect to ${action.parameters.url}`)
        break

      default:
        result.errors.push(`Unknown action type: ${action.type}`)
    }

    return result
  }

  private isPolicyApplicable(policy: Policy, context: PolicyExecutionContext): boolean {
    // Check if policy applies to this request
    if (policy.conditions) {
      return this.evaluateConditions(policy.conditions, context)
    }
    return true
  }

  private evaluateConditions(conditions: PolicyCondition[], context: PolicyExecutionContext): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, context))
  }

  private evaluateCondition(condition: PolicyCondition, context: PolicyExecutionContext): boolean {
    const value = this.getContextValue(condition.field, context)

    switch (condition.operator) {
      case "equals":
        return value === condition.value

      case "not_equals":
        return value !== condition.value

      case "contains":
        return String(value).includes(String(condition.value))

      case "greater_than":
        return Number(value) > Number(condition.value)

      case "less_than":
        return Number(value) < Number(condition.value)

      case "regex":
        return new RegExp(condition.value).test(String(value))

      default:
        return false
    }
  }

  private evaluateRuleCondition(condition: string, context: PolicyExecutionContext): boolean {
    // Simple condition evaluation - in production, use a proper expression parser
    try {
      // Replace context variables in condition
      let evaluatedCondition = condition

      // Replace common variables
      evaluatedCondition = evaluatedCondition.replace(/\$request\.method/g, `"${context.request.method}"`)
      evaluatedCondition = evaluatedCondition.replace(/\$request\.path/g, `"${context.request.path}"`)
      evaluatedCondition = evaluatedCondition.replace(/\$user\.id/g, `"${context.user?.id || ""}"`)

      // Evaluate the condition (unsafe - use proper parser in production)
      return eval(evaluatedCondition)
    } catch (error) {
      return false
    }
  }

  private getContextValue(field: string, context: PolicyExecutionContext): any {
    const parts = field.split(".")
    let value: any = context

    for (const part of parts) {
      if (value && typeof value === "object") {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  private transformRequest(request: any, parameters: Record<string, any>): any {
    const transformed = { ...request }

    if (parameters.addHeaders) {
      transformed.headers = { ...transformed.headers, ...parameters.addHeaders }
    }

    if (parameters.removeHeaders) {
      for (const header of parameters.removeHeaders) {
        delete transformed.headers[header]
      }
    }

    if (parameters.transformBody && transformed.body) {
      // Apply body transformations
      if (parameters.transformBody.type === "json") {
        transformed.body = this.transformJSON(transformed.body, parameters.transformBody.rules)
      }
    }

    return transformed
  }

  private transformJSON(data: any, rules: any[]): any {
    const transformed = { ...data }

    for (const rule of rules) {
      switch (rule.type) {
        case "rename_field":
          if (rule.from in transformed) {
            transformed[rule.to] = transformed[rule.from]
            delete transformed[rule.from]
          }
          break

        case "add_field":
          transformed[rule.field] = rule.value
          break

        case "remove_field":
          delete transformed[rule.field]
          break

        case "transform_field":
          if (rule.field in transformed) {
            transformed[rule.field] = this.applyFieldTransformation(transformed[rule.field], rule.transformation)
          }
          break
      }
    }

    return transformed
  }

  private applyFieldTransformation(value: any, transformation: any): any {
    switch (transformation.type) {
      case "uppercase":
        return String(value).toUpperCase()

      case "lowercase":
        return String(value).toLowerCase()

      case "encrypt":
        // Placeholder for encryption
        return `encrypted_${value}`

      case "hash":
        // Placeholder for hashing
        return `hashed_${value}`

      default:
        return value
    }
  }

  async listPolicies(): Promise<Policy[]> {
    return Array.from(this.policies.values())
  }

  async getPolicy(policyId: string): Promise<Policy | null> {
    return this.policies.get(policyId) || null
  }

  async enablePolicy(policyId: string): Promise<boolean> {
    const policy = this.policies.get(policyId)
    if (policy) {
      policy.enabled = true
      return true
    }
    return false
  }

  async disablePolicy(policyId: string): Promise<boolean> {
    const policy = this.policies.get(policyId)
    if (policy) {
      policy.enabled = false
      return true
    }
    return false
  }

  async evaluatePolicy(policy: any, context: any): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true }
  }
}
