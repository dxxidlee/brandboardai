import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Search,
  Palette,
  LayoutGrid,
  FileDown,
  Wand2,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_PROMPTS, BRANDS } from "@/lib/mock-data";

const FEATURES = [
  {
    icon: Search,
    title: "Instant brand audits",
    body: "Logo, palette, typography, positioning, competitors and creative insights — generated in seconds.",
  },
  {
    icon: Wand2,
    title: "AI moodboards",
    body: "Turn a single concept into a curated board of references, packaging, type and color systems.",
  },
  {
    icon: LayoutGrid,
    title: "Infinite canvas",
    body: "Arrange, resize and annotate cards on a fluid canvas that feels like Milanote meets Figma.",
  },
  {
    icon: Palette,
    title: "Color & type systems",
    body: "Extracted palettes and pairings, ready to drop straight into your design files.",
  },
  {
    icon: Layers,
    title: "Save & organize",
    body: "Every project lives in a tidy workspace. Reopen, duplicate and iterate anytime.",
  },
  {
    icon: FileDown,
    title: "Export anywhere",
    body: "Ship as PDF, PNG or a polished presentation to share with clients and teams.",
  },
];

const STEPS = [
  { n: "01", title: "Enter a prompt", body: "A company name, URL, or creative concept." },
  { n: "02", title: "AI does the research", body: "We gather data and analyze the brand." },
  { n: "03", title: "Get a living board", body: "Edit, curate and export your workspace." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
          <div className="animate-fade-in">
            <Badge variant="accent" className="mb-6 gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              Brand research, compressed into minutes
            </Badge>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            From a single prompt to a{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(280_70%_62%)] bg-clip-text text-transparent">
              complete brand world
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Brandboard AI generates brand audits, moodboards and creative
            strategy automatically. Stop collecting screenshots — start with a
            workspace.
          </p>

          {/* Prompt mock */}
          <div className="mx-auto mt-9 max-w-xl">
            <div className="group flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 transition-shadow focus-within:shadow-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <input
                disabled
                placeholder="Audit Airbnb, or 'Japanese luxury skincare'…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button asChild className="gap-1.5">
                <Link href="/login">
                  Generate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Try one:
              </span>
              {EXAMPLE_PROMPTS.map((p) => (
                <Link
                  key={p}
                  href="/login"
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {p}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · First board in under 60 seconds
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="relative mx-auto max-w-5xl px-5 pb-12">
          <BrandPreview />
        </div>

        {/* Trust strip */}
        <div className="relative mx-auto max-w-5xl px-5 pb-20">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by design teams at
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["Studio North", "Foundry", "Lumen", "Northwind", "Pixelary", "Kit"].map(
              (name) => (
                <span
                  key={name}
                  className="font-display text-xl italic text-muted-foreground"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to define a brand
            </h2>
            <p className="mt-3 text-muted-foreground">
              Research, strategy, and visual direction in one fluid workflow.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to a board
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-7">
                <span className="font-display text-4xl italic text-primary">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-[hsl(280_65%_55%)] px-8 py-16 text-center text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-20" />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Start your first brand board today
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/80">
            Free to try. No credit card required.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="relative mt-7 bg-background text-foreground hover:bg-background/90"
          >
            <Link href="/login">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function BrandPreview() {
  const brand = BRANDS[0];
  return (
    <div className="relative animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/60" />
          <span className="h-3 w-3 rounded-full bg-[hsl(40_90%_60%)]" />
          <span className="h-3 w-3 rounded-full bg-[hsl(140_50%_55%)]" />
        </div>
        <span className="ml-2 text-xs text-muted-foreground">
          Brandboard — {brand.name} audit
        </span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white"
            style={{ backgroundColor: brand.logoColor }}
          >
            {brand.logoMark}
          </div>
          <p className="mt-3 font-semibold">{brand.name}</p>
          <p className="text-xs text-muted-foreground">{brand.tagline}</p>
          <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
            {brand.summary}
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">Palette</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brand.colors.map((c) => (
              <div key={c.hex} className="text-center">
                <span
                  className="block h-10 w-10 rounded-lg border border-border"
                  style={{ backgroundColor: c.hex }}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Personality
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {brand.personality.slice(0, 4).map((p) => (
              <span
                key={p}
                className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {brand.references.map((r) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={r.id}
              src={r.url}
              alt={r.label}
              className="h-full w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
