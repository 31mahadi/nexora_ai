import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

const BLOG_MS = process.env.BLOG_MS_URL ?? "http://localhost:3007";

async function fetchBlog(tenantId: string, slug: string) {
  try {
    const res = await fetch(`${BLOG_MS}/blogs/slug/${slug}`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      title: string;
      content: string;
      excerpt: string | null;
      publishedAt: string | null;
    };
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  if (!tenantId) notFound();

  const post = await fetchBlog(tenantId, slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 py-16 px-6">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="text-sm text-zinc-600 hover:text-zinc-900 mb-6 inline-block"
        >
          ← Back to blog
        </Link>
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-zinc-500 text-sm mb-8">
            {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}
        <div className="prose prose-zinc max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-zinc-700">
            {post.content}
          </pre>
        </div>
      </article>
    </main>
  );
}
