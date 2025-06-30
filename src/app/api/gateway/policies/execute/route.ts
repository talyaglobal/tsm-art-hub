import type { NextRequest } from "next/server"
import { PolicyEngine } from "@/lib/policy-engine/policy-engine"
import { successResponse, errorResponse } from "@/lib/utils/response"

const policyEngine = new PolicyEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { policies, context, phase = "request" } = body

    if (!policies || !Array.isArray(policies)) {
      return errorResponse("Policies array is required", "validation_error")
    }

    if (!context) {
      return errorResponse("Execution context is required", "validation_error")
    }

    // Validate policies structure
    const validationErrors = validatePolicies(policies)
    if (validationErrors.length > 0) {
      return errorResponse(`Policy validation failed: ${validationErrors.join(", ")}`, "validation_error")
    }

    // Execute policies
    const result = await policyEngine.executePolicies(policies, context, phase)

    return successResponse({
      result,
      executedPolicies: policies.length,
      phase,
    })
  } catch (error) {
    console.error("Policy execution error:", error)
    return errorResponse("Policy execution failed", "execution_error", 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function validatePolicies(policies: any[]): string[] {
  const errors: string[] = []

  for (let i = 0; i < policies.length; i++) {
    const policy = policies[i]

    if (!policy.id) {
      errors.push(`Policy at index ${i} missing required field: id`)
    }

    if (!policy.name) {
      errors.push(`Policy at index ${i} missing required field: name`)
    }

    if (!policy.type) {
      errors.push(`Policy at index ${i} missing required field: type`)
    }

    if (typeof policy.enabled !== "boolean") {
      errors.push(`Policy at index ${i} missing required field: enabled`)
    }

    if (typeof policy.priority !== "number") {
      errors.push(`Policy at index ${i} missing required field: priority`)
    }

    if (!policy.config || typeof policy.config !== "object") {
      errors.push(`Policy at index ${i} missing required field: config`)
    }

    // Validate policy type
    const validTypes = [
      "authentication",
      "authorization",
      "rate_limiting",
      "transformation",
      "caching",
      "security",
      "logging",
      "monitoring",
      "custom",
    ]
    if (!validTypes.includes(policy.type)) {
      errors.push(`Policy at index ${i} has invalid type: ${policy.type}`)
    }
  }

  return errors
}

// Test endpoint for policy validation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "validate") {
    // Return policy validation schema
    return successResponse({
      schema: {
        type: "object",
        required: ["id", "name", "type", "enabled", "priority", "config"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: {
            type: "string",
            enum: [
              "authentication",
              "authorization",
              "rate_limiting",
              "transformation",
              "caching",
              "security",
              "logging",
              "monitoring",
              "custom",
            ],
          },
          enabled: { type: "boolean" },
          priority: { type: "number" },
          config: { type: "object" },
          conditions: {
            type: "array",
            items: {
              type: "object",
              required: ["field", "operator", "value"],
              properties: {
                field: { type: "string" },
                operator: {
                  type: "string",
                  enum: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "contains", "regex"],
                },
                value: {},
                logicalOperator: { type: "string", enum: ["AND", "OR"] },
              },
            },
          },
          description: { type: "string" },
        },
      },
    })
  }

  if (action === "test") {
    // Return test execution context
    return successResponse({
      testContext: {
        request: {
          method: "GET",
          path: "/api/test",
          headers: {
            authorization: "Bearer test-token",
            "x-api-key": "test-key",
            "user-agent": "Test Client/1.0",
          },
          query: {
            limit: "10",
            offset: "0",
          },
          body: null,
          ip: "127.0.0.1",
        },
        user: {
          id: "test-user",
          roles: ["user"],
          attributes: {
            plan: "premium",
            verified: true,
          },
        },
        api: {
          id: "test-api",
          name: "Test API",
          version: "1.0.0",
        },
        tenant: {
          id: "test-tenant",
          plan: "professional",
          limits: {
            requests_per_hour: 10000,
            max_integrations: 50,
          },
        },
        metadata: {},
      },
    })
  }

  return successResponse({
    message: "Policy execution engine ready",
    endpoints: {
      execute: "POST /api/gateway/policies/execute",
      validate: "GET /api/gateway/policies/execute?action=validate",
      test: "GET /api/gateway/policies/execute?action=test",
    },
  })
}
