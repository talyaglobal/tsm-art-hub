import type { NextRequest } from "next/server"
import { errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, method, headers, body: requestBody, parameters } = body

    // Simulate API testing with realistic responses
    const testResult = await simulateAPITest({
      endpoint,
      method,
      headers,
      body: requestBody,
      parameters,
    })

    return Response.json({
      success: true,
      data: testResult,
      message: "API test completed",
    })
  } catch (error) {
    console.error("API test error:", error)
    return errorResponse("Failed to test API", "test_error", 500)
  }
}

async function simulateAPITest(request: any) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

  const startTime = Date.now()
  const responseTime = Math.random() * 500 + 100

  // Simulate different response scenarios
  const scenarios = [
    {
      status: 200,
      success: true,
      data: generateMockResponse(request.endpoint, request.method),
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": "999",
        "X-Response-Time": `${responseTime}ms`,
      },
    },
    {
      status: 201,
      success: true,
      data: { id: "created_123", message: "Resource created successfully" },
      headers: {
        "Content-Type": "application/json",
        Location: "/api/v1/resource/created_123",
      },
    },
    {
      status: 400,
      success: false,
      error: {
        code: "validation_error",
        message: "Invalid request parameters",
        details: {
          field: "email",
          issue: "Invalid email format",
        },
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
    {
      status: 401,
      success: false,
      error: {
        code: "unauthorized",
        message: "Authentication required",
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
    {
      status: 404,
      success: false,
      error: {
        code: "not_found",
        message: "Resource not found",
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
  ]

  // Weight towards success responses (85% success rate)
  const weights = [0.6, 0.25, 0.05, 0.05, 0.05]
  const random = Math.random()
  let cumulativeWeight = 0
  let selectedScenario = scenarios[0]

  for (let i = 0; i < scenarios.length; i++) {
    cumulativeWeight += weights[i]
    if (random <= cumulativeWeight) {
      selectedScenario = scenarios[i]
      break
    }
  }

  return {
    request: {
      method: request.method,
      url: request.endpoint,
      headers: request.headers,
      body: request.body,
      parameters: request.parameters,
    },
    response: {
      status: selectedScenario.status,
      statusText: getStatusText(selectedScenario.status),
      headers: selectedScenario.headers,
      data: selectedScenario.success ? selectedScenario.data : undefined,
      error: !selectedScenario.success ? selectedScenario.error : undefined,
    },
    timing: {
      startTime,
      endTime: Date.now(),
      duration: responseTime,
    },
    success: selectedScenario.success,
  }
}

function generateMockResponse(endpoint: string, method: string) {
  const responses: Record<string, any> = {
    "/integrations": {
      GET: {
        integrations: [
          {
            id: "int_1234567890",
            name: "Shopify to Salesforce Sync",
            status: "active",
            created_at: "2024-01-15T10:30:00Z",
            last_sync: "2024-01-20T14:22:00Z",
            sync_count: 1247,
          },
          {
            id: "int_0987654321",
            name: "QuickBooks to HubSpot Integration",
            status: "active",
            created_at: "2024-01-10T09:15:00Z",
            last_sync: "2024-01-20T13:45:00Z",
            sync_count: 892,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 47,
          has_more: true,
        },
      },
      POST: {
        id: "int_" + Math.random().toString(36).substr(2, 9),
        name: "New Integration",
        status: "draft",
        created_at: new Date().toISOString(),
      },
    },
    "/webhooks": {
      GET: {
        webhooks: [
          {
            id: "wh_1234567890",
            url: "https://example.com/webhook",
            events: ["integration.completed", "integration.failed"],
            status: "active",
            created_at: "2024-01-15T10:30:00Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 12,
          has_more: false,
        },
      },
    },
    "/analytics": {
      GET: {
        metrics: {
          total_requests: 125847,
          successful_requests: 123456,
          failed_requests: 2391,
          average_response_time: 245,
          uptime_percentage: 99.8,
        },
        time_series: [
          { timestamp: "2024-01-20T00:00:00Z", requests: 1247, errors: 12 },
          { timestamp: "2024-01-20T01:00:00Z", requests: 1156, errors: 8 },
          { timestamp: "2024-01-20T02:00:00Z", requests: 987, errors: 5 },
        ],
      },
    },
  }

  const endpointKey = endpoint.split("?")[0] // Remove query parameters
  return responses[endpointKey]?.[method] || { message: "Mock response", timestamp: new Date().toISOString() }
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  }
  return statusTexts[status] || "Unknown"
}
