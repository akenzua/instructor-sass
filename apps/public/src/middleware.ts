import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRODUCTION_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "indrive.com";
const DEV_PORT = "3004";

/**
 * Middleware to handle subdomain routing for instructor microsites
 * 
 * URL Patterns:
 * - {username}.indrive.com -> /instructor/{username} (production)
 * - {username}.localhost:3004 -> /instructor/{username} (development)
 * - /i/{username} -> redirect to subdomain (fallback)
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const isProduction = process.env.NODE_ENV === "production";
  
  // Get the subdomain
  // In production: john-smith.indrive.com -> john-smith
  // In development: john-smith.localhost:3004 -> john-smith
  const currentHost = hostname
    .replace(`.localhost:${DEV_PORT}`, "")
    .replace(`.${PRODUCTION_DOMAIN}`, "")
    .replace(`:${DEV_PORT}`, "");
  
  // List of reserved subdomains that should not be treated as instructor usernames
  const reservedSubdomains = [
    "www",
    "app",
    "api",
    "admin",
    "instructor",
    "learner",
    "dashboard",
    "blog",
    "help",
    "support",
    "localhost",
  ];
  
  // Check if this is a valid instructor subdomain (not reserved and not the main domain)
  const isInstructorSubdomain = 
    currentHost &&
    !reservedSubdomains.includes(currentHost) &&
    /^[a-z0-9-]+$/.test(currentHost) && // Valid username format
    currentHost !== hostname; // Not the main domain
  
  // Handle fallback path URL: /i/{username} -> redirect to subdomain
  if (url.pathname.startsWith("/i/")) {
    const username = url.pathname.split("/")[2];
    if (username && /^[a-z0-9-]+$/.test(username)) {
      const remainingPath = url.pathname.replace(`/i/${username}`, "") || "/";
      
      if (isProduction) {
        // Production: 301 redirect to subdomain for SEO
        return NextResponse.redirect(
          new URL(`https://${username}.${PRODUCTION_DOMAIN}${remainingPath}`),
          301
        );
      }
      // In dev, rewrite to internal route
      url.pathname = `/instructor/${username}${remainingPath === "/" ? "" : remainingPath}`;
      return NextResponse.rewrite(url);
    }
  }
  
  // If we have a valid instructor subdomain, rewrite to the instructor route
  if (isInstructorSubdomain) {
    // Rewrite to /instructor/{username}/... internally
    const newPathname = `/instructor/${currentHost}${url.pathname}`;
    url.pathname = newPathname;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
