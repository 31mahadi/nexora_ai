import { Badge, Button, Card } from "@nexora/ui";
import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="min-h-screen py-16 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="default" className="mb-6">
          Tenant Admin
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">
          Manage your portfolio
        </h1>
        <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto">
          Profile, blog, timeline, AI knowledge, theme customization, and more — all in one place.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link href="/login">
            <Button variant="secondary" className="px-8 py-3">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="px-8 py-3">Create account</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <Card variant="outlined" className="border-zinc-200">
            <h3 className="font-semibold text-zinc-900 mb-2">Profile</h3>
            <p className="text-sm text-zinc-600">Edit bio, avatar, social links</p>
          </Card>
          <Card variant="outlined" className="border-zinc-200">
            <h3 className="font-semibold text-zinc-900 mb-2">Content</h3>
            <p className="text-sm text-zinc-600">Blog, timeline, AI knowledge</p>
          </Card>
          <Card variant="outlined" className="border-zinc-200">
            <h3 className="font-semibold text-zinc-900 mb-2">Analytics</h3>
            <p className="text-sm text-zinc-600">Views, usage, subscription</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
