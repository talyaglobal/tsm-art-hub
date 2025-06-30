import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"
import type { DataPipeline } from "@/types/gateway"

export async function GET(request: NextRequest) {
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

    const { data: pipelines, error } = await supabase
      .from("data_pipelines")
      .select(`
        *,
        source_integrations:integrations!inner(id, name, type, provider)
      `)
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return successResponse({
      pipelines: pipelines || [],
      count: pipelines?.length || 0,
    })
  } catch (error) {
    console.error("Get pipelines error:", error)
    return errorResponse("Failed to fetch pipelines", "server_error", 500)
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
    const { name, description, sourceIntegrations, transformations, destinations, schedule } = body

    if (!name || !sourceIntegrations || !Array.isArray(sourceIntegrations)) {
      return errorResponse("Missing required fields", "validation_error")
    }

    const pipeline: Omit<DataPipeline, "id" | "createdAt" | "updatedAt"> = {
      tenantId: profile.tenant_id,
      name,
      description,
      sourceIntegrations,
      transformations: transformations || [],
      destinations: destinations || [],
      schedule: schedule || { type: "realtime" },
      status: "active",
      metrics: {
        recordsProcessed: 0,
        successRate: 1.0,
        avgProcessingTime: 0,
      },
    }

    const { data, error } = await supabase
      .from("data_pipelines")
      .insert({
        ...pipeline,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return successResponse(data, "Pipeline created successfully")
  } catch (error) {
    console.error("Create pipeline error:", error)
    return errorResponse("Failed to create pipeline", "server_error", 500)
  }
}
