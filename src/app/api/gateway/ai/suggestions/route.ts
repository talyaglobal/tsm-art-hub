import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AIAssistant } from "@/lib/gateway/ai-assistant"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

const aiAssistant = new AIAssistant()

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

    // Get existing integrations
    const { data: integrations } = await supabase.from("integrations").select("*").eq("tenant_id", profile.tenant_id)

    // Generate AI suggestions
    const suggestions = await aiAssistant.generateIntegrationSuggestions(profile.tenant_id, integrations || [])

    // Store suggestions in database
    if (suggestions.length > 0) {
      await supabase.from("ai_suggestions").upsert(
        suggestions.map((s) => ({
          ...s,
          tenant_id: s.tenantId,
          created_at: s.createdAt,
        })),
      )
    }

    return successResponse({
      suggestions,
      count: suggestions.length,
    })
  } catch (error) {
    console.error("Get AI suggestions error:", error)
    return errorResponse("Failed to generate suggestions", "server_error", 500)
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

    const { suggestionId, action } = await request.json()

    if (!suggestionId || !["accept", "reject"].includes(action)) {
      return errorResponse("Invalid request parameters", "validation_error")
    }

    // Update suggestion status
    const { data, error } = await supabase
      .from("ai_suggestions")
      .update({
        status: action === "accept" ? "accepted" : "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", suggestionId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // If accepted, implement the suggestion
    if (action === "accept" && data) {
      await this.implementSuggestion(data)
    }

    return successResponse(data, `Suggestion ${action}ed successfully`)
  } catch (error) {
    console.error("Update suggestion error:", error)
    return errorResponse("Failed to update suggestion", "server_error", 500)
  }
}

async function implementSuggestion(suggestion: any): Promise<void> {
  // Implementation logic based on suggestion type
  switch (suggestion.type) {
    case "integration":
      // Create integration template or guide user through setup
      break
    case "transformation":
      // Create data transformation pipeline
      break
    case "optimization":
      // Apply optimization settings
      break
  }
}
