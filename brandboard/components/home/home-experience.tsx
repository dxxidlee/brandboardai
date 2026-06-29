"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WelcomeHero } from "@/components/home/welcome-hero";
import { PromptComposer } from "@/components/home/prompt-composer";
import { SuggestionPills } from "@/components/home/suggestion-pills";
import { ChatBubble } from "@/components/home/chat-bubble";
import { ProgressTimeline } from "@/components/home/progress-timeline";
import { LoadingIndicator } from "@/components/home/loading-indicator";
import {
  ANALYSIS_STEPS,
  PROMPT_EXAMPLES,
  SUGGESTED_PROMPTS,
} from "@/components/home/home-data";

type InputType = "company" | "url" | "concept" | "industry";

type AuditResponse = {
  projectId?: string;
  jobId?: string;
  debugMock?: boolean;
  ready?: boolean;
  error?: string;
};

/** Light heuristic to map a free-form prompt to the backend's input types. */
function inferInputType(prompt: string): InputType {
  const text = prompt.trim().toLowerCase();
  if (/\b[a-z0-9-]+\.[a-z]{2,}(\/|\b)/.test(text)) return "url";
  if (/^(build|create|design|launch|imagine|invent|make|start)\b/.test(text)) {
    return "concept";
  }
  return "company";
}

const STEP_INTERVAL_MS = 620;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Phase = "welcome" | "conversation";

export function HomeExperience() {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>("welcome");
  const [prompt, setPrompt] = React.useState("");
  const [submittedPrompt, setSubmittedPrompt] = React.useState("");
  const [activeStep, setActiveStep] = React.useState(-1);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const startAudit = React.useCallback(
    async (text: string): Promise<AuditResponse> => {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, inputType: inferInputType(text) }),
      });
      const data = (await res.json()) as AuditResponse;
      if (!res.ok) throw new Error(data.error ?? "Failed to start audit");
      if (!data.projectId || !data.jobId) {
        throw new Error("Invalid response from audit API");
      }
      return data;
    },
    []
  );

  const handleSubmit = React.useCallback(async () => {
    const text = prompt.trim();
    if (!text || busy) return;

    setBusy(true);
    setError(null);
    setSubmittedPrompt(text);
    setPrompt("");
    setPhase("conversation");
    setActiveStep(-1);

    // Kick off the real audit immediately; animate the checklist meanwhile.
    const auditPromise: Promise<AuditResponse> = startAudit(text).catch(
      (err: unknown) => ({
        error: err instanceof Error ? err.message : "Something went wrong",
      })
    );

    // Reveal the assistant's intro, then step through the analysis checklist.
    await sleep(450);
    for (let i = 0; i <= ANALYSIS_STEPS.length; i++) {
      if (!mounted.current) return;
      setActiveStep(i);
      await sleep(STEP_INTERVAL_MS);
    }

    const data = await auditPromise;
    if (!mounted.current) return;

    if (data.error || !data.projectId) {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
      return;
    }

    await sleep(400);
    if (!mounted.current) return;

    if (data.debugMock && data.ready) {
      router.push(`/projects/${data.projectId}`);
    } else {
      router.push(
        `/projects/${data.projectId}?generating=true&jobId=${data.jobId}`
      );
    }
  }, [prompt, busy, startAudit, router]);

  const reset = () => {
    setPhase("welcome");
    setError(null);
    setBusy(false);
    setActiveStep(-1);
    setSubmittedPrompt("");
  };

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {phase === "welcome" ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-10"
            >
              <WelcomeHero />
              <div className="w-full">
                <PromptComposer
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleSubmit}
                  disabled={busy}
                  examples={PROMPT_EXAMPLES}
                  autoFocus
                />
                <div className="mt-5">
                  <SuggestionPills
                    prompts={SUGGESTED_PROMPTS}
                    onSelect={setPrompt}
                    disabled={busy}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full flex-col gap-5"
            >
              <ChatBubble role="user">{submittedPrompt}</ChatBubble>

              <ChatBubble role="assistant">
                <div className="space-y-3.5">
                  <p>
                    Great choice. I&apos;ll analyze your brand across these
                    dimensions:
                  </p>
                  <ProgressTimeline
                    steps={ANALYSIS_STEPS}
                    activeIndex={activeStep}
                  />

                  {!error && activeStep >= ANALYSIS_STEPS.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-1"
                    >
                      <LoadingIndicator label="Setting up your workspace…" />
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 pt-1"
                    >
                      <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={reset}>
                          Try again
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard">Back to dashboard</Link>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ChatBubble>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
