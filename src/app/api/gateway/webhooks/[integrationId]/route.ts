import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { successResponse, errorResponse, notFoundResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest, { params }: { params: { integrationId: string } }) {
  try {
    const supabase = createClient()

    // Verify integration exists
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", params.integrationId)
      .single()

    if (!integration) {
      return notFoundResponse("Integration not found")
    }

    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    // Store webhook event
    const { data: webhookEvent, error } = await supabase
      .from("webhook_events")
      .insert({
        tenant_id: integration.tenant_id,
        integration_id: params.integrationId,
        type: headers["x-event-type"] || "unknown",
        payload: body,
        status: "pending",
        retry_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Process webhook asynchronously
    processWebhookAsync(webhookEvent.id)

    return successResponse(
      {
        received: true,
        eventId: webhookEvent.id,
      },
      "Webhook received",
    )
  } catch (error) {
    console.error("Webhook processing error:", error)
    return errorResponse("Failed to process webhook", "server_error", 500)
  }
}

async function processWebhookAsync(eventId: string): Promise<void> {
  // This would typically be handled by a background job queue
  setTimeout(async () => {
    const supabase = createClient()

    try {
      const { data: event } = await supabase.from("webhook_events").select("*").eq("id", eventId).single()

      if (!event) return

      // Process the webhook based on type and payload
      await processWebhookEvent(event)

      // Update status to completed
      await supabase
        .from("webhook_events")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", eventId)
    } catch (error) {
      console.error("Async webhook processing error:", error)

      // Update status to failed and increment retry count
      await supabase
        .from("webhook_events")
        .update({
          status: "failed",
          retry_count: supabase.rpc("increment_retry_count", { event_id: eventId }),
        })
        .eq("id", eventId)
    }
  }, 100)
}

async function processWebhookEvent(event: any): Promise<void> {
  // Implement webhook processing logic based on event type
  switch (event.type) {
    case "order.created":
      // Process new order data
      break
    case "customer.updated":
      // Process customer update
      break
    case "inventory.changed":
      // Process inventory change
      break
    default:
      console.log("Unknown webhook event type:", event.type)
  }
}
