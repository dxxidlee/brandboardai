import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  FileDown,
  LayoutGrid,
  Sparkles,
  Camera,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Target,
  Search,
  Palette,
  Share,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopySwatch } from "@/components/audit/copy-swatch";
import { AuditGeneratingView } from "@/components/audit/audit-generating-view";
import {
  getLatestAuditJob,
  getProjectAudit,
  getProjectStatus,
} from "@/lib/queries/project-audit";
import type { Insight } from "@/lib/mock-data";
import {
  CONFIDENCE_LABELS,
  logoColorFromTitle,
  type ConfidenceLevel,
} from "@/types/domain";

const INSIGHT_META: Record<
  Insight["tag"],
  { icon: typeof Lightbulb; color: string }
> = {
  Opportunity: { icon: Lightbulb, color: "hsl(40 90% 45%)" },
  Strength: { icon: ShieldCheck, color: "hsl(140 50% 42%)" },
  Risk: { icon: AlertTriangle, color: "hsl(0 72% 51%)" },
  Recommendation: { icon: Target, color: "hsl(256 64% 56%)" },
};

const CONFIDENCE_BADGE: Record<
  ConfidenceLevel,
  "default" | "secondary" | "outline"
> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export default async function AuditResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ generating?: string; jobId?: string }>;
}) {
  const { projectId } = await params;
  const { generating, jobId: jobIdFromQuery } = await searchParams;
  const statusOnly = await getProjectStatus(projectId);

  if (!statusOnly) {
    notFound();
  }

  const latestJob = await getLatestAuditJob(projectId);
  const jobId = jobIdFromQuery ?? latestJob?.id ?? null;

  if (statusOnly.status === "generating" || generating === "true") {
    if (!jobId) {
      notFound();
    }

    return (
      <AuditGeneratingView
        projectId={projectId}
        jobId={jobId}
        projectTitle={statusOnly.title ?? statusOnly.input_prompt ?? "your brand"}
      />
    );
  }

  if (statusOnly.status === "failed") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Audit failed
        </h1>
        <p className="mt-2 text-muted-foreground">
          {latestJob?.error ??
            "We couldn't complete the brand audit for this project."}
        </p>
        <div className="mt-8 flex gap-2">
          <Button asChild>
            <Link href="/new">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const data = await getProjectAudit(projectId);
  if (!data) {
    notFound();
  }

  const {
    project,
    audit,
    board,
    personality,
    competitors,
    insights,
    audience,
    confidenceLevel,
    assumptions,
    needsResearch,
    brandAssets,
    isDebugMock,
  } = data;

  const logoColor =
    brandAssets.colors[0]?.hex ?? logoColorFromTitle(project.title);
  const logoMark = project.title.charAt(0).toUpperCase();
  const boardHref = board
    ? `/projects/${projectId}/boards/${board.id}`
    : `/projects/${projectId}`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={boardHref}>
              <LayoutGrid className="h-4 w-4" />
              Open canvas
            </Link>
          </Button>
        </div>
      </div>

      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        {brandAssets.connected && brandAssets.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandAssets.logoUrl}
            alt={`${project.title} logo`}
            className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-white object-contain p-2 shadow-lg"
          />
        ) : (
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-lg"
            style={{ backgroundColor: logoColor }}
          >
            {logoMark}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {project.title}
            </h1>
            <Badge variant="secondary">{project.input_type}</Badge>
            {isDebugMock && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-400">
                Debug mock audit
              </Badge>
            )}
            {confidenceLevel && (
              <Badge variant={CONFIDENCE_BADGE[confidenceLevel]}>
                {CONFIDENCE_LABELS[confidenceLevel].label}
              </Badge>
            )}
          </div>
          {confidenceLevel && (
            <p className="mt-1 text-sm text-muted-foreground">
              {CONFIDENCE_LABELS[confidenceLevel].description}
            </p>
          )}
          {project.input_prompt && (
            <p className="mt-1 font-display text-xl italic text-muted-foreground">
              “{project.input_prompt}”
            </p>
          )}
          {brandAssets.websiteUrl && (
            <a
              href={brandAssets.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {brandAssets.websiteUrl.replace(/^https?:\/\//, "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {!brandAssets.websiteUrl &&
            project.input_type === "url" &&
            project.input_prompt && (
            <a
              href={
                project.input_prompt.startsWith("http")
                  ? project.input_prompt
                  : `https://${project.input_prompt}`
              }
              className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {project.input_prompt}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Brand Overview" eyebrow="01">
            <p className="leading-relaxed text-muted-foreground">
              {audit.summary}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Mission" value={audit.mission ?? ""} />
              <Field label="Positioning" value={audit.positioning ?? ""} />
            </div>
            {audience && (
              <div className="mt-4">
                <Field label="Audience" value={audience} />
              </div>
            )}
            {personality.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Brand personality
                </p>
                <div className="flex flex-wrap gap-2">
                  {personality.map((p) => (
                    <Badge key={p} variant="accent" className="px-3 py-1">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {(assumptions.length > 0 || needsResearch.length > 0) && (
            <Section title="Research Notes" eyebrow="02">
              {assumptions.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assumptions
                  </p>
                  <ul className="space-y-2">
                    {assumptions.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg bg-secondary/50 px-3 py-2 text-sm text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {needsResearch.length > 0 && (
                <div className={assumptions.length > 0 ? "mt-5" : ""}>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Search className="h-3.5 w-3.5" />
                    Needs research
                  </p>
                  <ul className="space-y-2">
                    {needsResearch.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          <Section title="Visual Identity" eyebrow="03">
            {brandAssets.connected ? (
              <>
                {brandAssets.description && (
                  <p className="mb-5 leading-relaxed text-muted-foreground">
                    {brandAssets.description}
                  </p>
                )}
                {brandAssets.colors.length > 0 && (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Color palette
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {brandAssets.colors.map((color) => (
                        <CopySwatch key={color.hex} color={color} />
                      ))}
                    </div>
                  </>
                )}
                {brandAssets.fonts.length > 0 && (
                  <div className={brandAssets.colors.length > 0 ? "mt-6" : ""}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Typography
                    </p>
                    <div className="space-y-3">
                      {brandAssets.fonts.map((font) => (
                        <div
                          key={`${font.family}-${font.role}`}
                          className="rounded-xl border border-border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {font.family}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {font.role} · {font.source}
                            </span>
                          </div>
                          <p
                            className="mt-2 text-2xl tracking-tight"
                            style={{ fontFamily: font.family }}
                          >
                            {font.sample}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <UnconnectedBlock
                  icon={Palette}
                  title="Brand assets not connected yet"
                  description="We couldn't retrieve logo, colors, or fonts from Brandfetch for this brand. The strategic audit below is still available."
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <PlaceholderTile label="Color palette" />
                  <PlaceholderTile label="Typography" />
                  <PlaceholderTile label="Photography" />
                </div>
              </>
            )}
          </Section>

          <Section title="Visual References" eyebrow="04">
            {brandAssets.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {brandAssets.images.map((image) => (
                  <figure
                    key={image.url}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.label}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="truncate text-sm font-medium">
                        {image.label}
                      </span>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {image.source}
                      </Badge>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-8 text-center">
                <Camera className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-medium">
                  Image sources not connected yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Brandfetch did not return reference images for this brand. Logo,
                  colors, and fonts may still appear above when available.
                </p>
              </div>
            )}
          </Section>

          <Section title="Competitive Landscape" eyebrow="05">
            <div className="grid gap-3 sm:grid-cols-3">
              {competitors.map((c) => (
                <div
                  key={c.name}
                  className="rounded-xl border border-border p-4"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
                    style={{ backgroundColor: c.accent }}
                  >
                    {c.initial}
                  </span>
                  <p className="mt-3 font-semibold">{c.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.positioning}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Social Presence" eyebrow="06" compact>
            <UnconnectedBlock
              icon={Share}
              title="Not connected yet"
              description="Social scraping is not enabled. Follower counts and engagement metrics will appear here once connected."
              compact
            />
          </Section>

          <Section title="Creative Insights" eyebrow="07" compact accent>
            <div className="space-y-3">
              {insights.map((insight) => {
                const meta = INSIGHT_META[insight.tag];
                const Icon = meta.icon;
                return (
                  <div
                    key={insight.title}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${meta.color}1a`,
                          color: meta.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: meta.color }}
                      >
                        {insight.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{insight.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {insight.body}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button asChild className="mt-4 w-full gap-2">
              <Link href={boardHref}>
                <Sparkles className="h-4 w-4" />
                Build moodboard
              </Link>
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
  compact,
  accent,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  compact?: boolean;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-border ${
        accent ? "bg-accent/30" : "bg-card"
      } ${compact ? "p-5" : "p-6"}`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="font-display text-lg italic text-primary">
          {eyebrow}
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function UnconnectedBlock({
  icon: Icon,
  title,
  description,
  compact,
}: {
  icon: typeof Palette;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-border bg-secondary/20 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <Badge variant="outline" className="mt-3">
            Coming soon
          </Badge>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTile({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/10 px-4 py-8 text-center opacity-60">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">Not connected yet</p>
    </div>
  );
}
