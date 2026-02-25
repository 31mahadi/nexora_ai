import { headers } from "next/headers";
import type { MetadataRoute } from "next";

const BLOG_MS = process.env.BLOG_MS_URL ?? "http://localhost:3007";

async function fetchBlogSlugs(tenantId: string): Promise<string[]> {
  try {
    const res = await fetch(`${BLOG_MS}/blogs?published=true`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { slug: string }[];
    return data.map((b) => b.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3002";
  const tenantId = h.get("x-tenant-id");
  const base = `https://${host}`;

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  if (tenantId) {
    const slugs = await fetchBlogSlugs(tenantId);
    for (const slug of slugs) {
      entries.push({
        url: `${base}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
