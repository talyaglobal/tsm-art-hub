import type { NextRequest } from "next/server"
import { errorResponse } from "@/lib/utils/response"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { files, packageName, version } = body

    if (!files || !Array.isArray(files)) {
      return errorResponse("Files array is required", "validation_error", 400)
    }

    // Create ZIP file
    const zip = new JSZip()

    // Add files to ZIP
    for (const file of files) {
      zip.file(file.path, file.content)
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Return ZIP file
    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packageName || "tsmarthub-sdk"}-v${version || "1.0.0"}.zip"`,
      },
    })
  } catch (error) {
    console.error("SDK download error:", error)
    return errorResponse("Failed to create SDK download", "download_error", 500)
  }
}
