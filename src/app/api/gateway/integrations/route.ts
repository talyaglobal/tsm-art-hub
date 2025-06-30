import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { IntegrationManager } from "@/lib/gateway/integration-manager"
import { TenantManager } from "@/lib/gateway/tenant-manager"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

const integrationManager = new IntegrationManager()
const tenantManager = new TenantManager()

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse("Authentication required")
    }

    // Get tenant ID from user profile
    const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user.id).single()

    if (!profile?.tenant_id) {
      return errorResponse("No tenant associated with user", "no_tenant")
    }

    const integrations = await integrationManager.getIntegrations(profile.tenant_id)

    return successResponse({
      integrations,
      count: integrations.length,
    })
  } catch (error) {
    console.error("Get integrations error:", error)
    return errorResponse("Failed to fetch integrations", "server_error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse("Authentication required")
    }

    const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user.id).single()

    if (!profile?.tenant_id) {
      return errorResponse("No tenant associated with user", "no_tenant")
    }

    const body = await request.json()
    const { name, type, provider, config } = body

    // Validate required fields
    if (!name || !type || !provider || !config) {
      return errorResponse("Missing required fields", "validation_error")
    }

    // Check tenant quota
    const tenant = await tenantManager.getTenant(profile.tenant_id)
    if (!tenant) {
      return errorResponse("Tenant not found", "tenant_not_found")
    }

    const existingIntegrations = await integrationManager.getIntegrations(profile.tenant_id)
    if (existingIntegrations.length >= tenant.settings.maxIntegrations) {
      return errorResponse("Integration limit exceeded", "quota_exceeded")
    }

    const integration = await integrationManager.createIntegration({
      tenantId: profile.tenant_id,
      name,
      type,
      provider,
      status: "configuring",
      config,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        dataPointsProcessed: 0,
      },
    })

    // Test the connection
    const connectionTest = await integrationManager.testConnection(integration)

    // Update status based on test result
    await supabase
      .from("integrations")
      .update({
        status: connectionTest.success ? "connected" : "error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration.id)

    return successResponse(
      {
        integration: {
          ...integration,
          status: connectionTest.success ? "connected" : "error",
        },
        connectionTest,
      },
      "Integration created successfully",
    )
  } catch (error) {
    console.error("Create integration error:", error)
    return errorResponse("Failed to create integration", "server_error", 500)
  }
}
