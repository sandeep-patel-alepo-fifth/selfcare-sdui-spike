import { NextRequest, NextResponse } from "next/server";
import { DEMO_TENANTS, DEFAULT_TENANT } from "@/types/tenant";

/**
 * Middleware for tenant resolution
 *
 * Resolution order:
 * 1. Subdomain: tenant1.selfcare.com → tenantId = 'tenant1'
 * 2. Query param: ?tenant=tenant1 (for development)
 * 3. Header: X-Tenant-ID (for API calls)
 * 4. Default: Use default tenant
 */
export function middleware(request: NextRequest) {
  const tenantId = resolveTenant(request);

  // Validate tenant exists
  const tenant = DEMO_TENANTS[tenantId] || DEFAULT_TENANT;

  // Check if tenant is active
  if (tenant.status === "suspended") {
    return new NextResponse("Tenant suspended", { status: 403 });
  }

  // Clone headers and add tenant info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenant.id);
  requestHeaders.set("x-tenant-name", tenant.name);

  // Continue with modified request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function resolveTenant(request: NextRequest): string {
  // 1. Check subdomain
  const hostname = request.headers.get("host") || "";
  const subdomain = getSubdomain(hostname);
  if (subdomain && subdomain in DEMO_TENANTS) {
    return subdomain;
  }

  // 2. Check query param (development only)
  if (process.env.NODE_ENV === "development") {
    const tenantParam = request.nextUrl.searchParams.get("tenant");
    if (tenantParam && tenantParam in DEMO_TENANTS) {
      return tenantParam;
    }
  }

  // 3. Check header
  const headerTenant = request.headers.get("x-tenant-id");
  if (headerTenant && headerTenant in DEMO_TENANTS) {
    return headerTenant;
  }

  // 4. Default tenant
  return "default";
}

function getSubdomain(hostname: string): string | null {
  // Handle localhost:port
  if (hostname.startsWith("localhost")) {
    return null;
  }

  // Handle IP addresses
  if (/^\d+\.\d+\.\d+\.\d+/.test(hostname)) {
    return null;
  }

  // Extract subdomain from hostname
  // e.g., "telcomax.selfcare.com" → "telcomax"
  const parts = hostname.split(".");

  // Need at least 3 parts for a subdomain (sub.domain.tld)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Ignore common non-tenant subdomains
    if (!["www", "api", "app", "admin"].includes(subdomain)) {
      return subdomain;
    }
  }

  return null;
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
