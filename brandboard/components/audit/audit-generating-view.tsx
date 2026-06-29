"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type JobStatus = "queued" | "running" | "succeeded" | "failed";

type JobResponse = {
  job: {
    id: string;
    project_id: string;
    status: JobStatus;
    progress: number;
    step: string | null;
    error: string | null;
  };
};

type AuditGeneratingViewProps = {
  projectId: string;
  jobId: string;
  projectTitle: string;
};

const POLL_INTERVAL_MS = 1000;

export function AuditGeneratingView({
  projectId,
  jobId,
  projectTitle,
}: AuditGeneratingViewProps) {
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState("Queued");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = (path: string) => {
      if (cancelled) return;
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      setDone(true);
      window.location.replace(path);
    };

    const poll = async () => {
      if (cancelled) return;

      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        const data = (await res.json()) as JobResponse & { error?: string };

        if (res.ok) {
          const { job } = data;
          setProgress(job.progress);
          setCurrentStep(job.step ?? "Processing…");

          if (job.status === "succeeded") {
            finish(`/projects/${projectId}`);
            return;
          }

          if (job.status === "failed") {
            finish(`/projects/${projectId}`);
            return;
          }
        }
      } catch {
        // Retry on transient errors.
      }

      if (!cancelled) {
        pollTimer = setTimeout(() => {
          void poll();
        }, POLL_INTERVAL_MS);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [jobId, projectId]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Building your audit
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Researching {projectTitle}
      </p>

      <div className="mt-8 w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Current step</p>
          <p className="text-sm font-semibold tabular-nums text-primary">
            {Math.max(progress, 0)}%
          </p>
        </div>
        <p className="mt-2 text-base text-foreground">{currentStep}</p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
      </div>

      {done && (
        <p className="mt-4 text-sm text-muted-foreground">Loading results…</p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Audits target under 75 seconds. Step updates live from the pipeline.
      </p>

      <Button asChild variant="outline" className="mt-4">
        <Link href="/new">Back to home</Link>
      </Button>
    </div>
  );
}
