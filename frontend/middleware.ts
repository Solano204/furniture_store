// THIS  MIDDLE WILL INTERCEPT ALL REQUEST AND WILL CHECK IF ARE PUBLICS THE SAME WAY (SPRING FILTER)
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { decrypt, getDataFromCookie } from "./app/utils/Api/Actions/cookies-session";
import { cookies } from "next/headers";
import { auth } from "./app/utils/Api/Actions/Security";
// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard"];
const publicRoutes = [
  "/",
  "/products(.*)",
  "/about",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
];
const adminRoutes = ["/admin,","/admin/sales", "/admin/products", "/admin/products/create"];


export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoutes = protectedRoutes.includes(path);
  const isPublicRoutes = publicRoutes.includes(path);
  const isAdminRoutes = adminRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("sessionita")?.value;
  const session = await decrypt(cookie);
  if ((isProtectedRoutes || isAdminRoutes) && cookie == null) {
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
