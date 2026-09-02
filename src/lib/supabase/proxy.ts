import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/internships",
  "/activities",
  "/advisor",
  "/profile",
] as const;

const AUTH_ENTRY_ROUTES = ["/login", "/register", "/forgot-password"] as const;

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isPrivateRoute(pathname: string) {
  return PRIVATE_ROUTE_PREFIXES.some((route) => matchesRoute(pathname, route));
}

function isAuthEntryRoute(pathname: string) {
  return AUTH_ENTRY_ROUTES.some((route) => matchesRoute(pathname, route));
}

function copySessionState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });

  for (const header of ["cache-control", "expires", "pragma"] as const) {
    const value = source.headers.get(header);

    if (value) {
      target.headers.set(header, value);
    }
  }

  return target;
}

function redirectPreservingSession(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  return copySessionState(sessionResponse, NextResponse.redirect(url));
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;

  if (!isAuthenticated && isPrivateRoute(pathname)) {
    return redirectPreservingSession(request, supabaseResponse, "/login");
  }

  if (isAuthenticated && isAuthEntryRoute(pathname)) {
    return redirectPreservingSession(request, supabaseResponse, "/dashboard");
  }

  return supabaseResponse;
}
