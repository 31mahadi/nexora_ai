import { Badge, Button, Card } from "@nexora/ui";

const features = [
  {
    title: "AI-Powered Chat",
    description:
      "Your portfolio comes alive with an AI assistant that knows your work, skills, and journey.",
  },
  {
    title: "Timeline",
    description: "Chronological view of achievements, roles, projects, and milestones.",
  },
  {
    title: "Blog & Content",
    description: "Share insights with SEO-optimized blogs and optional guest engagement.",
  },
  {
    title: "GitHub Stats",
    description: "Automatic integration showcasing your contribution activity.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-indigo-600">
            Nexora
          </span>
          <div className="flex gap-4">
            <a href="#features">
              <Button variant="ghost">Features</Button>
            </a>
            <a href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003"}>
              <Button variant="secondary">Dashboard</Button>
            </a>
            <a href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003"}/signup`}>
              <Button>Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="success" className="mb-6">
            AI-Powered Personal Brand
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6">
            Your portfolio.
            <br />
            <span className="text-indigo-600">Supercharged.</span>
          </h1>
          <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto">
            Build a multi-tenant AI portfolio SaaS. Each user gets a unique subdomain, timeline,
            blog, and an AI chat that understands them deeply.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003"}/signup`}>
              <Button className="px-8 py-3 text-lg">Start building</Button>
            </a>
            <a href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003"}/login`}>
              <Button variant="secondary" className="px-8 py-3 text-lg">
                Sign in
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-zinc-900 mb-4">
            Everything you need
          </h2>
          <p className="text-zinc-600 text-center mb-12 max-w-2xl mx-auto">
            AI-Powered Personal Brand SaaS Infrastructure for professionals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} variant="elevated" className="hover:shadow-xl transition-shadow">
                <h3 className="font-semibold text-lg text-zinc-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-zinc-600 text-sm">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-12 px-6 mt-20">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-zinc-500 text-sm">Nexora — AI-Powered Personal Brand SaaS</span>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a
              href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003"}/login`}
              className="hover:text-indigo-600"
            >
              Login
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003"}/signup`}
              className="hover:text-indigo-600"
            >
              Sign up
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
