import { NextResponse } from "next/server"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

interface ErrorResponse {
  success: false
  error: string
  message?: string
  timestamp: string
  details?: any
}

interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  meta?: SuccessResponse<T>["meta"],
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    meta,
  }
}

export function createErrorResponse(error: string, message?: string, details?: any): ErrorResponse {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    details,
  }
}

export function successResponse<T = any>(
  data: T,
  message?: string,
  status = 200,
  meta?: SuccessResponse<T>["meta"],
): NextResponse {
  return NextResponse.json(createSuccessResponse(data, message, meta), { status })
}

export function errorResponse(error: string, message?: string, status = 400, details?: any): NextResponse {
  return NextResponse.json(createErrorResponse(error, message, details), { status })
}

export function notFoundResponse(resource = "Resource"): NextResponse {
  return errorResponse("Not Found", `${resource} not found`, 404)
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return errorResponse("Unauthorized", message, 401)
}

export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return errorResponse("Forbidden", message, 403)
}

export function validationErrorResponse(errors: any[]): NextResponse {
  return errorResponse("Validation Error", "Request validation failed", 422, { errors })
}

export function internalServerErrorResponse(message = "Internal Server Error"): NextResponse {
  return errorResponse("Internal Server Error", message, 500)
}

export function conflictResponse(message = "Resource already exists"): NextResponse {
  return errorResponse("Conflict", message, 409)
}

export function tooManyRequestsResponse(retryAfter?: number): NextResponse {
  const response = errorResponse("Too Many Requests", "Rate limit exceeded", 429)

  if (retryAfter) {
    response.headers.set("Retry-After", retryAfter.toString())
  }

  return response
}

export function createdResponse<T = any>(data: T, message = "Resource created successfully"): NextResponse {
  return successResponse(data, message, 201)
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function paginatedResponse<T = any>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): NextResponse {
  const totalPages = Math.ceil(total / limit)

  return successResponse(data, message, 200, {
    page,
    limit,
    total,
    totalPages,
  })
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("not found")) {
      return notFoundResponse()
    }

    if (error.message.includes("unauthorized")) {
      return unauthorizedResponse()
    }

    if (error.message.includes("forbidden")) {
      return forbiddenResponse()
    }

    if (error.message.includes("validation")) {
      return validationErrorResponse([{ message: error.message }])
    }

    return internalServerErrorResponse(error.message)
  }

  return internalServerErrorResponse()
}

export function withErrorHandling<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export function corsResponse(response: NextResponse, origin?: string): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", origin || "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
  response.headers.set("Access-Control-Max-Age", "86400")

  return response
}

export function setCacheHeaders(response: NextResponse, maxAge: number): NextResponse {
  response.headers.set("Cache-Control", `public, max-age=${maxAge}`)
  response.headers.set("ETag", `"${Date.now()}"`)

  return response
}

export function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export function jsonResponse<T = any>(data: T, status = 200, headers?: Record<string, string>): NextResponse {
  const response = NextResponse.json(data, { status })

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

export function streamResponse(stream: ReadableStream, contentType = "application/octet-stream"): NextResponse {
  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Transfer-Encoding": "chunked",
    },
  })
}

export function redirectResponse(url: string, permanent = false): NextResponse {
  return NextResponse.redirect(url, permanent ? 301 : 302)
}

export function healthCheckResponse(status: "healthy" | "unhealthy" | "degraded"): NextResponse {
  const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503

  return successResponse(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
    },
    `System is ${status}`,
    statusCode,
  )
}
