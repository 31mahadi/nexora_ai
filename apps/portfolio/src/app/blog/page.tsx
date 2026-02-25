import { Badge, Card } from "@nexora/ui";
import { headers } from "next/headers";
import Link from "next/link";

const BLOG_MS = process.env.BLOG_MS_URL ?? "http://localhost:3007";

async function fetchBlogs(tenantId: string) {
  try {
    const res = await fetch(`${BLOG_MS}/blogs?published=true`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      publishedAt: string | null;
    }[];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const blogs = tenantId ? await fetchBlogs(tenantId) : [];

  return (
    <main className="min-h-screen bg-zinc-50 py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Blog</h1>
        {blogs.length > 0 ? (
          <div className="space-y-6">
            {blogs.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`}>
                <Card
                  variant="outlined"
                  className="border-zinc-200 hover:border-zinc-300 transition"
                >
                  <h2 className="font-semibold text-zinc-900 text-lg">{b.title}</h2>
                  {b.excerpt && (
                    <p className="text-zinc-600 text-sm mt-2 line-clamp-2">{b.excerpt}</p>
                  )}
                  {b.publishedAt && (
                    <Badge variant="default" className="mt-3">
                      {new Date(b.publishedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="outlined" className="border-zinc-200">
            <p className="text-zinc-600">
              {tenantId
                ? "No blog posts yet. Add some from the admin panel."
                : "Connect your subdomain to see blog posts."}
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
