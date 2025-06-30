import { type NextRequest, NextResponse } from "next/server"
import { DataCleansingService } from "@/lib/data/data-cleanser"
import { createClient } from "@/lib/supabase/server"

const cleansingService = new DataCleansingService()

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data, cleansingRules, validationRules } = await request.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data array is required" }, { status: 400 })
    }

    let result: any = { cleansedData: data }

    // Apply cleansing rules if provided
    if (cleansingRules && Array.isArray(cleansingRules) && cleansingRules.length > 0) {
      result = await cleansingService.cleanseData(data, cleansingRules)
    }

    // Apply validation rules if provided
    let validationResult = null
    if (validationRules && Array.isArray(validationRules) && validationRules.length > 0) {
      validationResult = await cleansingService.validateData(result.cleansedData, validationRules)
    }

    return NextResponse.json({
      success: true,
      cleansingResult: result,
      validationResult,
      message: "Data cleansing completed",
    })
  } catch (error) {
    console.error("Data cleansing error:", error)
    return NextResponse.json({ error: "Failed to cleanse data" }, { status: 500 })
  }
}

export async function GET() {
  const supportedCleansingRules = cleansingService.getSupportedCleansingRules()
  const supportedValidationRules = cleansingService.getSupportedValidationRules()

  return NextResponse.json({
    supportedCleansingRules,
    supportedValidationRules,
    message: "Data Cleansing API",
  })
}
