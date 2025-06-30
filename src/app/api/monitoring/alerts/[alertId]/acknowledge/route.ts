import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { alertId: string } }) {
  try {
    const supabase = createClient()
    const { alertId } = params
    const body = await request.json()
    const { acknowledgedBy, notes } = body

    // Update alert status to acknowledged
    const { data, error } = await supabase
      .from("monitoring_alerts")
      .update({
        status: "acknowledged",
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    // Log the acknowledgment
    await supabase.from("alert_history").insert({
      alert_id: alertId,
      action: "acknowledged",
      performed_by: acknowledgedBy,
      notes: notes || null,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      id: data.id,
      status: data.status,
      acknowledgedBy: data.acknowledged_by,
      acknowledgedAt: data.acknowledged_at,
      notes: data.notes,
    })
  } catch (error) {
    console.error("Error acknowledging alert:", error)
    return NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { alertId: string } }) {
  try {
    const supabase = createClient()
    const { alertId } = params
    const body = await request.json()
    const { resolvedBy, resolution } = body

    // Update alert status to resolved
    const { data, error } = await supabase
      .from("monitoring_alerts")
      .update({
        status: "resolved",
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        resolution: resolution || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    // Log the resolution
    await supabase.from("alert_history").insert({
      alert_id: alertId,
      action: "resolved",
      performed_by: resolvedBy,
      notes: resolution || null,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      id: data.id,
      status: data.status,
      resolvedBy: data.resolved_by,
      resolvedAt: data.resolved_at,
      resolution: data.resolution,
    })
  } catch (error) {
    console.error("Error resolving alert:", error)
    return NextResponse.json({ error: "Failed to resolve alert" }, { status: 500 })
  }
}
