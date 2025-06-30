import { type NextRequest, NextResponse } from "next/server"
import { DataTypeConverter } from "@/lib/data/type-converter"
import { createClient } from "@/lib/supabase/server"

const typeConverter = new DataTypeConverter()

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data, conversionRules } = await request.json()

    if (!data || !Array.isArray(data) || !conversionRules || !Array.isArray(conversionRules)) {
      return NextResponse.json(
        {
          error: "Data array and conversion rules are required",
        },
        { status: 400 },
      )
    }

    const result = await typeConverter.convertDataset(data, conversionRules)

    return NextResponse.json({
      success: true,
      ...result,
      message: "Data conversion completed",
    })
  } catch (error) {
    console.error("Type conversion error:", error)
    return NextResponse.json({ error: "Failed to convert data types" }, { status: 500 })
  }
}

export async function GET() {
  const supportedConversions = typeConverter.getSupportedConversions()

  return NextResponse.json({
    supportedConversions,
    message: "Data Type Conversion API",
  })
}
