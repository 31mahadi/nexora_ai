import { type NextRequest, NextResponse } from "next/server";

const PORTFOLIO_MS = process.env.PORTFOLIO_MS_URL ?? "http://localhost:3006";
const TENANT_MS = process.env.TENANT_MS_URL ?? "http://localhost:3005";
const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? "http://localhost:3003";

function getSubdomain(host: string): string | null {
  const parts = host.replace(/:\d+$/, "").split(".");
  if (parts.length < 2) return null;
  const subdomain = parts[0];
  if (subdomain === "www" || subdomain === "localhost") return null;
  return subdomain;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.replace(/:\d+$/, "");
  const subdomain = getSubdomain(host);

  const requestHeaders = new Headers(request.headers);

  const url = request.nextUrl;
  const previewToken = url.searchParams.get("token");
  const isPreview = url.searchParams.get("preview") === "1" && previewToken;

  if (isPreview && previewToken) {
    try {
      const previewRes = await fetch(
        `${ADMIN_APP_URL}/api/admin/preview-store?token=${encodeURIComponent(previewToken)}`,
        { cache: "no-store" },
      );
      if (previewRes.ok) {
        const preview = (await previewRes.json()) as {
          settings?: unknown;
          theme?: { primary?: string; accent?: string };
        };
        if (preview.settings) {
          requestHeaders.set("x-tenant-settings", JSON.stringify(preview.settings));
        }
        if (preview.theme) {
          requestHeaders.set(
            "x-tenant-theme",
            JSON.stringify({
              primary: preview.theme.primary ?? "#0f172a",
              accent: preview.theme.accent ?? "#6366f1",
            }),
          );
        }
      }
    } catch {
      // Preview fetch failed - fall through to tenant resolution
    }
  }

  const valueToResolve = subdomain ?? hostWithoutPort;
  if (valueToResolve) {
    try {
      const tenantRes = await fetch(`${TENANT_MS}/tenants/resolve`, {
        headers: {
          "X-Tenant-Subdomain": subdomain ?? "",
          "X-Tenant-Host": hostWithoutPort,
        },
      });
      if (!tenantRes.ok) {
        requestHeaders.set("x-tenant-resolve-status", String(tenantRes.status));
      }
      if (tenantRes.ok) {
        const tenant = (await tenantRes.json()) as {
          id: string;
          name?: string;
          theme?: unknown;
          settings?: unknown;
        };
        requestHeaders.set("x-tenant-id", tenant.id);
        if (tenant.name) requestHeaders.set("x-tenant-name", tenant.name);
        if (!isPreview) {
          requestHeaders.set("x-tenant-theme", JSON.stringify(tenant.theme ?? {}));
          requestHeaders.set("x-tenant-settings", JSON.stringify(tenant.settings ?? {}));
        }
      }
    } catch {
      // Tenant not found - continue
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
