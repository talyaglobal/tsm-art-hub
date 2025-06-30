import { type NextRequest, NextResponse } from "next/server"
import { SchemaInferenceService } from "@/lib/data/schema-inference"
import { createClient } from "@/lib/supabase/server"

const schemaInferenceService = new SchemaInferenceService()

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data, options = {} } = await request.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data array is required" }, { status: 400 })
    }

    const inferredSchema = await schemaInferenceService.inferSchema(data, options)

    return NextResponse.json({
      success: true,
      schema: inferredSchema,
      message: "Schema inferred successfully",
    })
  } catch (error) {
    console.error("Schema inference error:", error)
    return NextResponse.json({ error: "Failed to infer schema" }, { status: 500 })
  }
}
