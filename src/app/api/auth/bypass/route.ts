import type { NextRequest } from "next/server"
import { errorResponse } from "@/lib/utils/response"

export async function POST(request: NextRequest) {
  try {
    // Generate a bypass token for development/testing
    const bypassToken = generateBypassToken()

    // In a real implementation, you might want to:
    // 1. Store the token in a database with expiration
    // 2. Associate it with specific permissions
    // 3. Log the bypass for security auditing

    return Response.json({
      success: true,
      token: bypassToken,
      message: "Authentication bypassed successfully",
      expires_in: 3600, // 1 hour
      permissions: ["read", "write", "test"],
    })
  } catch (error) {
    console.error("Bypass authentication error:", error)
    return errorResponse("Failed to bypass authentication", "bypass_error", 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirect = searchParams.get("redirect") || "/"

    // Generate bypass token and redirect
    const bypassToken = generateBypassToken()

    // Create response with redirect
    const response = Response.redirect(new URL(redirect, request.url))

    // Set bypass token as cookie
    response.headers.set("Set-Cookie", `bypass_token=${bypassToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`)

    return response
  } catch (error) {
    console.error("Bypass redirect error:", error)
    return errorResponse("Failed to process bypass redirect", "bypass_error", 500)
  }
}

function generateBypassToken(): string {
  // Generate a secure random token for bypass authentication
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = "bypass_"

  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}
