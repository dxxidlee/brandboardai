import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  FileDown,
  Sparkles,
  Compass,
  Palette,
  Type,
  Images,
  Users,
  Swords,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Target,
  Search,
  NotebookPen,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopySwatch } from "@/components/audit/copy-swatch";
import { AuditGeneratingView } from "@/components/audit/audit-generating-view";
import { Section, FallbackState } from "@/components/workspace/section";
import { WorkspaceChatPanel } from "@/components/workspace/chat-panel";
import { WorkspaceAssetPanel } from "@/components/workspace/asset-panel";
import { VisualReferences } from "@/components/workspace/visual-references";
import {
  MoodboardPreview,
  OpenCanvasButton,
} from "@/components/workspace/moodboard-preview";
import { MobileChat } from "@/components/workspace/mobile-chat";
import {
  getLatestAuditJob,
  getProjectAudit,
  getProjectChatMessages,
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
      <div className="flex flex-1 flex-col">
        <AuditGeneratingView
          projectId={projectId}
          jobId={jobId}
          projectTitle={statusOnly.title ?? statusOnly.input_prompt ?? "your brand"}
        />
      </div>
    );
  }

  if (statusOnly.status === "failed") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Audit didn&apos;t complete
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          {latestJob?.error ??
            "We couldn't complete the brand audit for this project."}
        </p>
        <div className="mt-8 flex gap-2">
          <Button asChild>
            <Link href="/new">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/new">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const data = await getProjectAudit(projectId);
  if (!data) {
    notFound();
  }

  const chatMessages = await getProjectChatMessages(projectId);
  const initialMessages = chatMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));

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
  const confidenceText = confidenceLevel
    ? CONFIDENCE_LABELS[confidenceLevel].label
    : null;
  const promptText = project.input_prompt ?? project.title;

  return (
    <div className="flex min-h-0 flex-1">
      {/* Left: persistent AI chat panel */}
      <aside className="hidden w-[330px] shrink-0 flex-col border-r border-border/50 bg-card/20 p-4 backdrop-blur-sm lg:flex">
        <WorkspaceChatPanel
          projectId={projectId}
          prompt={promptText}
          title={project.title}
          summary={audit.summary ?? ""}
          confidenceLabel={confidenceText}
          initialMessages={initialMessages}
        />
      </aside>

      {/* Center: dynamic brand workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/50 glass px-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <MobileChat
              projectId={projectId}
              prompt={promptText}
              title={project.title}
              summary={audit.summary ?? ""}
              confidenceLabel={confidenceText}
              initialMessages={initialMessages}
            />
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <OpenCanvasButton boardHref={boardHref} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-6">
            {/* Canvas-first hero — the visual workspace is the destination */}
            <Section
              id="moodboard"
              eyebrow="Workspace"
              title="Your creative canvas"
              icon={LayoutGrid}
            >
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Jump into the infinite board to arrange references, colors, and
                type — the audit details below are here whenever you need them.
              </p>
              <MoodboardPreview
                boardHref={boardHref}
                colors={brandAssets.colors}
                images={brandAssets.images}
                fontFamily={brandAssets.fonts[0]?.family ?? null}
              />
            </Section>

            {/* Secondary: the audit report */}
            <div className="flex items-center gap-3 px-1 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                Brand audit · details
              </span>
              <span className="h-px flex-1 bg-border/70" />
            </div>

            {/* Brand Snapshot */}
            <Section eyebrow="01 · Snapshot" title="Brand Snapshot" icon={Sparkles}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {brandAssets.connected && brandAssets.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandAssets.logoUrl}
                    alt={`${project.title} logo`}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-border/60 bg-white object-contain p-2 shadow-lg"
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: logoColor }}
                  >
                    {logoMark}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {project.title}
                    </h1>
                    <Badge variant="secondary" className="capitalize">
                      {project.input_type}
                    </Badge>
                    {isDebugMock && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/50 text-amber-700 dark:text-amber-400"
                      >
                        Debug mock
                      </Badge>
                    )}
                    {confidenceLevel && (
                      <Badge variant={CONFIDENCE_BADGE[confidenceLevel]}>
                        {CONFIDENCE_LABELS[confidenceLevel].label}
                      </Badge>
                    )}
                  </div>
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
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {audit.summary}
                  </p>
                  {personality.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {personality.map((p) => (
                        <Badge key={p} variant="accent" className="px-3 py-1">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* 2 · Strategic Positioning */}
            <Section
              id="positioning"
              eyebrow="02 · Strategy"
              title="Strategic Positioning"
              icon={Compass}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mission" value={audit.mission} />
                <Field label="Positioning" value={audit.positioning} />
              </div>
            </Section>

            {/* 3 · Visual Identity */}
            <Section
              eyebrow="03 · Identity"
              title="Visual Identity"
              icon={Palette}
            >
              {brandAssets.connected &&
              (brandAssets.colors.length > 0 || brandAssets.fonts.length > 0) ? (
                <div className="space-y-6">
                  {brandAssets.description && (
                    <p className="leading-relaxed text-muted-foreground">
                      {brandAssets.description}
                    </p>
                  )}
                  {brandAssets.colors.length > 0 && (
                    <div>
                      <Label icon={Palette}>Color palette</Label>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {brandAssets.colors.map((color) => (
                          <CopySwatch key={color.hex} color={color} />
                        ))}
                      </div>
                    </div>
                  )}
                  {brandAssets.fonts.length > 0 && (
                    <div>
                      <Label icon={Type}>Typography</Label>
                      <div className="mt-3 space-y-3">
                        {brandAssets.fonts.map((font) => (
                          <div
                            key={`${font.family}-${font.role}`}
                            className="rounded-2xl border border-border/60 bg-card/30 p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
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
                </div>
              ) : (
                <FallbackState
                  icon={Palette}
                  title="Brand assets not connected yet"
                  description="We couldn't retrieve a logo, colors, or fonts for this brand. The strategic audit is still fully available."
                />
              )}
            </Section>

            {/* 4 · Pulled Images / Visual References */}
            <Section
              id="visual-references"
              eyebrow="04 · References"
              title="Pulled Images"
              icon={Images}
            >
              <VisualReferences images={brandAssets.images} />
            </Section>

            {/* 5 · Audience */}
            <Section eyebrow="05 · Audience" title="Audience" icon={Users}>
              {audience ? (
                <p className="leading-relaxed text-muted-foreground">{audience}</p>
              ) : (
                <FallbackState
                  icon={Users}
                  title="Audience not specified"
                  description="No distinct audience profile was captured for this brand yet."
                />
              )}
            </Section>

            {/* 6 · Competitors */}
            <Section
              id="competitors"
              eyebrow="06 · Landscape"
              title="Competitors"
              icon={Swords}
            >
              {competitors.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {competitors.map((c) => (
                    <div
                      key={c.name}
                      className="rounded-2xl border border-border/60 bg-card/30 p-4"
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
              ) : (
                <FallbackState
                  icon={Swords}
                  title="No competitors mapped"
                  description="The competitive landscape wasn't populated for this brand."
                />
              )}
            </Section>

            {/* 7 · Opportunities */}
            <Section
              eyebrow="07 · Opportunities"
              title="Creative Opportunities"
              icon={Lightbulb}
            >
              {insights.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {insights.map((insight) => {
                    const meta = INSIGHT_META[insight.tag];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={insight.title}
                        className="rounded-2xl border border-border/60 bg-card/30 p-4"
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
                        <p className="mt-2 text-sm font-semibold">
                          {insight.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {insight.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <FallbackState
                  icon={Lightbulb}
                  title="No opportunities yet"
                  description="Creative opportunities will appear here once generated."
                />
              )}
            </Section>

            {/* 8 · Research Notes */}
            {(assumptions.length > 0 || needsResearch.length > 0) && (
              <Section
                eyebrow="08 · Notes"
                title="Research Notes"
                icon={NotebookPen}
              >
                {assumptions.length > 0 && (
                  <div>
                    <Label icon={NotebookPen}>Assumptions</Label>
                    <ul className="mt-2 space-y-2">
                      {assumptions.map((item) => (
                        <li
                          key={item}
                          className="rounded-xl bg-secondary/40 px-3 py-2 text-sm text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {needsResearch.length > 0 && (
                  <div className={assumptions.length > 0 ? "mt-5" : ""}>
                    <Label icon={Search}>Needs research</Label>
                    <ul className="mt-2 space-y-2">
                      {needsResearch.map((item) => (
                        <li
                          key={item}
                          className="rounded-xl border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            )}

            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Right: optional asset / insight panel */}
      <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border/50 bg-card/20 p-4 backdrop-blur-sm 2xl:flex">
        <WorkspaceAssetPanel
          brandAssets={brandAssets}
          confidenceLabel={
            confidenceLevel
              ? CONFIDENCE_LABELS[confidenceLevel].description
              : null
          }
          stats={{
            competitors: competitors.length,
            insights: insights.length,
            references: brandAssets.images.length,
          }}
        />
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-secondary/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed">
        {value || "Not specified."}
      </p>
    </div>
  );
}

function Label({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}
