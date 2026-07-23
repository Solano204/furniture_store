// Intercepts every request and checks auth the same way a Spring filter would.
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/utils/Api/Actions/cookies-session";
import { cookies } from "next/headers";

// 1. Specify protected and admin routes. Anything not listed here falls
// through unauthenticated by design - only these two lists are enforced.
const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];

// Plain .includes(path) only matches a route string exactly, so nested/dynamic
// pages under a listed prefix (e.g. /admin/products/edit/abc123 under /admin)
// were never actually covered - only the literal parent path was.
export function matchesRoutePrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoutes = matchesRoutePrefix(path, protectedRoutes);
  const isAdminRoutes = matchesRoutePrefix(path, adminRoutes);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("sessionita")?.value;
  const session = await decrypt(cookie);
  // Check session, not just cookie presence - an expired/tampered cookie is
  // still non-null but decrypt() returns a null session, and that case must
  // redirect too or it silently bypasses auth on protected/admin routes.
  if ((isProtectedRoutes || isAdminRoutes) && session == null) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  if ((isProtectedRoutes || isAdminRoutes) && session != null) {
    const isAdminUser = session.userId === process.env.ADMIN_USER_ID;
    if (isAdminRoutes && isAdminUser) {
      // its admin and is privet
      return NextResponse.next();
    }

    if (isAdminRoutes && !isAdminUser) {
      // if its authenticate but no is admid ..>homepage
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    //return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }
}
