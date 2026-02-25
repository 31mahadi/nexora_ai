import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

function toRole(value: unknown): "super-admin" | "tenant-admin" | "user" {
  if (value === "super-admin" || value === "tenant-admin") return value;
  return "user";
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail closed for protected routes when Supabase env is not configured.
  if (!supabaseUrl || !supabaseAnonKey) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isDashboard) {
    const meta = user?.app_metadata as { role?: unknown; tenant_id?: string } | undefined;
    const role = toRole(meta?.role);
    const tenantId = meta?.tenant_id;

    if (role !== "tenant-admin" || !tenantId) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-tenant-id", tenantId);
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
