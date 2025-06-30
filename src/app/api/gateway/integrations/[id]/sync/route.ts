import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { IntegrationManager } from "@/lib/gateway/integration-manager"
import { TenantManager } from "@/lib/gateway/tenant-manager"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"

const integrationManager = new IntegrationManager()
const tenantManager = new TenantManager()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify integration belongs to tenant
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", params.id)
      .eq("tenant_id", profile.tenant_id)
      .single()

    if (!integration) {
      return notFoundResponse("Integration not found")
    }

    // Check quota before sync
    const hasQuota = await tenantManager.checkQuota(profile.tenant_id, 1)
    if (!hasQuota) {
      return errorResponse("API quota exceeded", "quota_exceeded", 429)
    }

    // Perform data sync
    const syncResult = await integrationManager.syncData(params.id)

    // Record usage
    await tenantManager.recordUsage(
      profile.tenant_id,
      1,
      syncResult.recordsProcessed * 1024, // Estimate data size
      integration.provider,
    )

    return successResponse(
      {
        syncResult,
        integration: {
          id: integration.id,
          name: integration.name,
          status: syncResult.errors.length > 0 ? "error" : "connected",
        },
      },
      "Data sync completed",
    )
  } catch (error) {
    console.error("Sync integration error:", error)
    return errorResponse("Failed to sync integration", "server_error", 500)
  }
}
