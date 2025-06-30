import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Extract tenant information from request
  const hostname = req.headers.get("host") || ""
  const subdomain = hostname.split(".")[0]
  const pathname = req.nextUrl.pathname

  // Handle subdomain-based tenant routing
  if (hostname.includes(".tsmarthub.com") && subdomain !== "www" && subdomain !== "app") {
    // This is a tenant subdomain
    const tenantSlug = subdomain

    // Verify tenant exists and is active
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("id, status, settings")
      .eq("subdomain", tenantSlug)
      .eq("status", "active")
      .single()

    if (error || !tenant) {
      // Tenant not found or inactive
      const redirectUrl = new URL("/tenant-not-found", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Add tenant context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-tenant-id", tenant.id)
    requestHeaders.set("x-tenant-slug", tenantSlug)

    // Continue with tenant context
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/apis",
    "/integrations",
    "/pipelines",
    "/analytics",
    "/monitor",
    "/security",
    "/logs",
    "/settings",
    "/users",
    "/admin",
    "/billing",
    "/profile",
  ]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check tenant access for authenticated users on protected routes
  if (session && isProtectedRoute) {
    // Get user's tenant association
    const { data: tenantUser, error: tenantError } = await supabase
      .from("tenant_users")
      .select(`
        tenant_id,
        role,
        status,
        tenants!inner(id, status)
      `)
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .single()

    if (tenantError || !tenantUser || tenantUser.tenants.status !== "active") {
      // User has no active tenant or tenant is inactive
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/onboarding"
      return NextResponse.redirect(redirectUrl)
    }

    // Add tenant context to headers for API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-tenant-id", tenantUser.tenant_id)
    requestHeaders.set("x-user-role", tenantUser.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Redirect to dashboard if accessing auth pages with session
  if (session && pathname.startsWith("/auth")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
