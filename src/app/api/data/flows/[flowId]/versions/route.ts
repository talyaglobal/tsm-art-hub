import { type NextRequest, NextResponse } from "next/server"
import { FlowVersionControlService } from "@/lib/data/flow-version-control"
import { createClient } from "@/lib/supabase/server"

const versionControlService = new FlowVersionControlService()

export async function GET(request: NextRequest, { params }: { params: { flowId: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const branch = searchParams.get("branch") || undefined
    const author = searchParams.get("author") || undefined
    const since = searchParams.get("since") || undefined
    const until = searchParams.get("until") || undefined

    const versions = await versionControlService.getVersionHistory(params.flowId, {
      limit,
      branch,
      author,
      since,
      until,
    })

    return NextResponse.json({
      success: true,
      versions,
      count: versions.length,
    })
  } catch (error) {
    console.error("Get versions error:", error)
    return NextResponse.json({ error: "Failed to get versions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { flowId: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { flow, message, parentVersion } = await request.json()

    if (!flow || !message) {
      return NextResponse.json(
        {
          error: "Flow and message are required",
        },
        { status: 400 },
      )
    }

    const version = await versionControlService.createVersion(
      params.flowId,
      flow,
      message,
      user.email || user.id,
      parentVersion,
    )

    return NextResponse.json({
      success: true,
      version,
      message: "Version created successfully",
    })
  } catch (error) {
    console.error("Create version error:", error)
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}
