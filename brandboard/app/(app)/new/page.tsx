"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  Link2,
  Lightbulb,
  Briefcase,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_PROMPTS } from "@/lib/mock-data";

const INPUT_TYPES = [
  { id: "company", label: "Company", icon: Building2, hint: "e.g. Airbnb" },
  { id: "url", label: "Website", icon: Link2, hint: "e.g. airbnb.com" },
  { id: "concept", label: "Concept", icon: Lightbulb, hint: "e.g. Luxury skincare" },
  { id: "industry", label: "Industry", icon: Briefcase, hint: "e.g. Wellness" },
] as const;

type InputType = (typeof INPUT_TYPES)[number]["id"];

export default function NewAuditPage() {
  const router = useRouter();
  const [type, setType] = React.useState<InputType>("company");
  const [prompt, setPrompt] = React.useState("Audit Airbnb");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const start = async () => {
    if (!prompt.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), inputType: type }),
      });

      const data = (await res.json()) as {
        projectId?: string;
        jobId?: string;
        debugMock?: boolean;
        ready?: boolean;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start audit");
      }

      if (!data.projectId || !data.jobId) {
        throw new Error("Invalid response from audit API");
      }

      if (data.debugMock && data.ready) {
        router.push(`/projects/${data.projectId}`);
        return;
      }

      router.push(
        `/projects/${data.projectId}?generating=true&jobId=${data.jobId}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Create a new board
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Tell us what to research. We&apos;ll generate the audit and moodboard.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label className="text-sm font-medium">What are you researching?</label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INPUT_TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button
                key={t.id}
                type="button"
                disabled={submitting}
                onClick={() => setType(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:border-primary/40 hover:bg-secondary/50"
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium" htmlFor="prompt">
            Prompt
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            disabled={submitting}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              INPUT_TYPES.find((t) => t.id === type)?.hint ?? "Describe it…"
            }
            className="mt-2 min-h-[110px] resize-none text-base"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={submitting}
              onClick={() => setPrompt(p)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={start}
          size="lg"
          className="mt-6 w-full gap-2"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {submitting ? "Starting audit…" : "Generate board"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          You&apos;ll be redirected immediately while the audit runs in the
          background.
        </p>
      </div>

      {submitting && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Creating project…
        </p>
      )}

      {error && (
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
