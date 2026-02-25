"use client";

import type { BlockType } from "@nexora/portfolio-builder";

interface BlockTypePreviewProps {
  blockType: BlockType;
}

export function BlockTypePreview({ blockType }: BlockTypePreviewProps) {
  const base = "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm";
  const accent = "bg-indigo-500 text-white";

  switch (blockType) {
    case "hero":
      return (
        <div className={`${base} space-y-3 text-center`}>
          <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            Welcome
          </span>
          <div className="space-y-1">
            <div className="mx-auto h-3 w-4/5 max-w-[140px] rounded bg-zinc-300" />
            <div className="mx-auto h-2 w-3/4 max-w-[100px] rounded bg-zinc-200" />
          </div>
          <div className={`mx-auto h-2.5 w-16 rounded-md ${accent}`} />
        </div>
      );
    case "text":
      return (
        <div className={`${base} space-y-3`}>
          <div className="h-3 w-2/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            <div className="h-2 w-full rounded bg-zinc-200" />
            <div className="h-2 w-full rounded bg-zinc-200" />
            <div className="h-2 w-4/5 rounded bg-zinc-200" />
          </div>
        </div>
      );
    case "skills":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            {[
              { name: "Frontend", skills: ["React", "Next.js", "HTML"] },
              { name: "Backend", skills: ["NestJS", "C#", "Laravel"] },
            ].map((seg, i) => (
              <div key={i}>
                <div className="mb-1 h-1.5 w-12 rounded bg-indigo-400" />
                <div className="flex flex-wrap gap-1">
                  {seg.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "services":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            {[
              { icon: "◆", title: "Consulting" },
              { icon: "◆", title: "Development" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-2"
              >
                <span className="text-indigo-500">{s.icon}</span>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-20 rounded bg-zinc-300" />
                  <div className="h-1.5 w-full rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "timeline":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            {[
              { date: "2024", title: "Project launch" },
              { date: "2023", title: "Senior role" },
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  {i < 1 && <div className="h-4 w-px bg-zinc-200" />}
                </div>
                <div className="flex-1 space-y-1 pb-1">
                  <div className="h-2 w-24 rounded bg-zinc-300" />
                  <div className="h-1.5 w-full rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/2 rounded bg-zinc-400" />
          <div className="rounded-lg border-l-4 border-indigo-400 bg-zinc-50 p-3">
            <p className="text-[10px] italic text-zinc-600">
              &ldquo;Great work and delivered on time.&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-zinc-300" />
              <div className="space-y-0.5">
                <div className="h-1.5 w-16 rounded bg-zinc-400" />
                <div className="h-1 w-12 rounded bg-zinc-300" />
              </div>
            </div>
          </div>
        </div>
      );
    case "cta":
      return (
        <div className={`${base} space-y-3 text-center`}>
          <div className="space-y-1">
            <div className="mx-auto h-3 w-3/4 max-w-[100px] rounded bg-zinc-400" />
            <div className="mx-auto h-2 w-1/2 max-w-[80px] rounded bg-zinc-200" />
          </div>
          <div className={`mx-auto h-2.5 w-20 rounded-md ${accent}`} />
        </div>
      );
    case "contact":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            <div className="h-2 w-full rounded bg-zinc-200" />
            <div className="h-2 w-full rounded bg-zinc-200" />
            <div className="h-2 w-4/5 rounded bg-zinc-200" />
          </div>
          <div className={`h-2.5 w-1/2 rounded-md ${accent}`} />
        </div>
      );
    case "blog-feed":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-zinc-100">
                <div className="aspect-video bg-zinc-200" />
                <div className="space-y-1 p-2">
                  <div className="h-2 w-full rounded bg-zinc-300" />
                  <div className="h-1.5 w-3/4 rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300"
              />
            ))}
          </div>
        </div>
      );
    case "stats":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "50+", label: "Projects" },
              { value: "10+", label: "Years" },
              { value: "30+", label: "Clients" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 text-center"
              >
                <div className="text-sm font-bold text-zinc-800">{stat.value}</div>
                <div className="text-[9px] text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "projects":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-zinc-100">
                <div className="aspect-video bg-zinc-200" />
                <div className="space-y-1 p-2">
                  <div className="h-2 w-full rounded bg-zinc-300" />
                  <div className="h-1.5 w-3/4 rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "client-logos":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-12 rounded bg-zinc-200" />
            ))}
          </div>
        </div>
      );
    case "pricing":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-2">
                <div className="h-2 w-16 rounded bg-zinc-300" />
                <div className="mt-1 h-3 w-12 rounded bg-zinc-400" />
                <div className={`mt-2 h-2 w-14 rounded ${accent}`} />
              </div>
            ))}
          </div>
        </div>
      );
    case "faq":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-zinc-200 p-2">
                <div className="h-2 w-full rounded bg-zinc-300" />
                <div className="mt-1 h-1.5 w-4/5 rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      );
    case "video":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="aspect-video rounded-lg bg-zinc-200 flex items-center justify-center">
            <span className="text-2xl text-zinc-400">▶</span>
          </div>
        </div>
      );
    case "process":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-indigo-500 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-20 rounded bg-zinc-300" />
                  <div className="h-1.5 w-full rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "certifications":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="flex flex-wrap gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2">
                <div className="h-8 w-8 rounded bg-zinc-200" />
                <div className="space-y-0.5">
                  <div className="h-2 w-16 rounded bg-zinc-300" />
                  <div className="h-1 w-12 rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "newsletter":
      return (
        <div className={`${base} space-y-2`}>
          <div className="h-2.5 w-1/3 rounded bg-zinc-400" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded bg-zinc-200" />
            <div className={`h-8 w-20 rounded ${accent}`} />
          </div>
        </div>
      );
    case "separator":
      return (
        <div className={`${base} flex items-center justify-center py-2`}>
          <div className="h-px w-full border-t-2 border-dashed border-zinc-300" />
        </div>
      );
    default:
      return (
        <div className={`${base}`}>
          <div className="h-8 w-full rounded-lg bg-zinc-100" />
        </div>
      );
  }
}
