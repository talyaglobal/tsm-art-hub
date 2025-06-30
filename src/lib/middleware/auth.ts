import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface AuthenticatedRequest extends NextRequest {
  user?: any
  session?: any
}

export async function withAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
) {
  try {
    const supabase = createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      )
    }

    // Add session and user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.session = session
    authenticatedRequest.user = session.user

    return handler(authenticatedRequest)
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Authentication check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
) {
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Add session and user to request if available
    const authenticatedRequest = request as AuthenticatedRequest
    if (session) {
      authenticatedRequest.session = session
      authenticatedRequest.user = session.user
    }

    return handler(authenticatedRequest)
  } catch (error) {
    console.error("Optional auth middleware error:", error)
    // Continue without authentication
    return handler(request as AuthenticatedRequest)
  }
}

export function withRoleAuth(requiredRoles: string[]) {
  return (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
    withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      const userRole = request.user?.user_metadata?.role || "user"

      if (!requiredRoles.includes(userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: `Required role: ${requiredRoles.join(" or ")}`,
            timestamp: new Date().toISOString(),
          },
          { status: 403 },
        )
      }

      return handler(request)
    })
}

export function withApiKeyAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "")

      if (!apiKey) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized",
            message: "API key required",
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        )
      }

      // Validate API key (this would typically check against a database)
      const isValidApiKey = await validateApiKey(apiKey)

      if (!isValidApiKey) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized",
            message: "Invalid API key",
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        )
      }

      return handler(request)
    } catch (error) {
      console.error("API key auth middleware error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Internal Server Error",
          message: "API key validation failed",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  }
}

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, status, expires_at")
      .eq("key_hash", hashApiKey(apiKey))
      .eq("status", "active")
      .single()

    if (error || !data) {
      return false
    }

    // Check if key is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false
    }

    return true
  } catch (error) {
    console.error("API key validation error:", error)
    return false
  }
}

function hashApiKey(apiKey: string): string {
  // In production, use a proper hashing algorithm like bcrypt or crypto
  const crypto = require("crypto")
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

export function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization")

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null
  }

  return authorization.substring(7)
}

export function extractTenantId(request: NextRequest): string | null {
  return request.headers.get("x-tenant-id")
}

export function extractUserRole(request: AuthenticatedRequest): string {
  return request.user?.user_metadata?.role || "user"
}
