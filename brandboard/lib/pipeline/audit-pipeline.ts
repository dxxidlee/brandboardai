import "server-only";

import { generateBrandAudit } from "@/lib/ai/brand-audit";
import { mapAuditOutputToDb } from "@/lib/ai/schemas";
import {
  resolveAndFetchBrand,
} from "@/lib/integrations/brandfetch/client";
import {
  saveBrandfetchAssets,
  type SavedBrandAssets,
} from "@/lib/integrations/brandfetch/save-brand-assets";
import { resolveDomainFromPrompt } from "@/lib/integrations/brandfetch/resolve-domain";
import { populateCanvasFromAssets } from "@/lib/pipeline/populate-canvas";
import { deriveTitle } from "@/lib/pipeline/derive-title";
import {
  createStepTimer,
  logPipeline,
  logPipelineError,
  logPipelineTimingSummary,
} from "@/lib/pipeline/logger";
import { PipelineTimeoutError, withTimeout } from "@/lib/pipeline/timeout";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

export { deriveTitle };

type ProjectInputType = Database["public"]["Enums"]["project_input_type"];

export type RunAuditPipelineInput = {
  projectId: string;
  jobId: string;
  boardId: string;
  prompt: string;
  inputType: ProjectInputType;
};

const PIPELINE_TIMEOUT_MS = 75_000;
const BRANDFETCH_TIMEOUT_MS = 8_000;
const OPENAI_TIMEOUT_MS = 45_000;

async function updateJob(
  projectId: string,
  jobId: string,
  patch: {
    status?: Database["public"]["Enums"]["job_status"];
    progress?: number;
    step?: string;
    error?: string | null;
  }
) {
  const admin = createAdminClient();
  const timer = createStepTimer(projectId, "job update");
  const { error } = await admin.from("jobs").update(patch).eq("id", jobId);
  const durationMs = timer.end({ jobId, step: patch.step ?? patch.status });
  if (error) throw new Error(`Failed to update job: ${error.message}`);
  return durationMs;
}

async function failJob(projectId: string, jobId: string, message: string) {
  logPipelineError(projectId, "Job failed", message);
  const admin = createAdminClient();
  await admin
    .from("jobs")
    .update({ status: "failed", error: message, progress: 0, step: "Failed" })
    .eq("id", jobId);
  await admin
    .from("projects")
    .update({ status: "failed" })
    .eq("id", projectId);
}

async function fetchBrandAssets(
  projectId: string,
  prompt: string,
  inputType: ProjectInputType,
  timings: Record<string, number>
): Promise<SavedBrandAssets | null> {
  const brandfetchTimer = createStepTimer(projectId, "Brandfetch call");
  const domainTimer = createStepTimer(projectId, "domain inference");
  const guessedDomain = resolveDomainFromPrompt(prompt, inputType);
  domainTimer.end({ domain: guessedDomain });

  try {
    const profile = await withTimeout(
      resolveAndFetchBrand({ prompt, inputType }),
      BRANDFETCH_TIMEOUT_MS,
      "Brandfetch API"
    );

    if (!profile) {
      timings.brandfetch = brandfetchTimer.end({
        found: false,
        domain: guessedDomain,
      });
      return null;
    }

    timings.brandfetch = brandfetchTimer.end({
      found: true,
      domain: profile.domain,
    });

    const saveTimer = createStepTimer(projectId, "saving assets");
    const saved = await saveBrandfetchAssets(projectId, profile);
    timings.saveAssets = saveTimer.end({ connected: saved.connected });
    return saved;
  } catch (error) {
    timings.brandfetch = brandfetchTimer.fail(error);
    if (error instanceof PipelineTimeoutError) {
      throw error;
    }
    return null;
  }
}

async function executeAuditPipeline(input: RunAuditPipelineInput) {
  const { projectId, jobId, prompt, inputType } = input;
  const timings: Record<string, number> = {};
  const pipelineTimer = createStepTimer(projectId, "overall pipeline");

  logPipeline(projectId, "Pipeline started", { jobId, inputType });

  timings.jobUpdate = await updateJob(projectId, jobId, {
    status: "running",
    progress: 10,
    step: "Fetching brand assets",
  });

  let brandAssets: SavedBrandAssets | null = null;
  let brandfetchTimedOut = false;
  try {
    brandAssets = await withTimeout(
      fetchBrandAssets(projectId, prompt, inputType, timings),
      BRANDFETCH_TIMEOUT_MS,
      "Brandfetch phase"
    );
  } catch (error) {
    if (error instanceof PipelineTimeoutError) {
      brandfetchTimedOut = true;
      logPipelineError(
        projectId,
        `Brandfetch exceeded ${BRANDFETCH_TIMEOUT_MS}ms — skipping`,
        error
      );
      timings.jobUpdate = await updateJob(projectId, jobId, {
        progress: 20,
        step: "Brandfetch timed out — continuing text-only",
      });
    } else {
      logPipelineError(projectId, "Brandfetch failed", error);
    }
    brandAssets = null;
  }

  if (brandAssets?.connected) {
    timings.jobUpdate = await updateJob(projectId, jobId, {
      progress: 30,
      step: "Brand assets connected",
    });
  } else if (!brandfetchTimedOut) {
    timings.jobUpdate = await updateJob(projectId, jobId, {
      progress: 25,
      step: "Continuing with text-only audit",
    });
  }

  timings.jobUpdate = await updateJob(projectId, jobId, {
    progress: 40,
    step: "Analyzing brand positioning",
  });

  const openAiTimer = createStepTimer(projectId, "OpenAI call");
  let auditResult;
  try {
    auditResult = await withTimeout(
      generateBrandAudit({ prompt, inputType, timeoutMs: OPENAI_TIMEOUT_MS }),
      OPENAI_TIMEOUT_MS,
      "OpenAI brand audit"
    );
    timings.openai = openAiTimer.end({
      usedFallback: auditResult.usedFallback,
      warningCount: auditResult.warnings.length,
    });
  } catch (error) {
    openAiTimer.fail(error);
    if (error instanceof PipelineTimeoutError) {
      throw new Error(
        `OpenAI audit timed out after ${OPENAI_TIMEOUT_MS / 1000}s. Try a shorter prompt or retry.`
      );
    }
    throw error;
  }

  if (auditResult.warnings.length > 0 || auditResult.usedFallback) {
    logPipeline(projectId, "OpenAI output normalized", {
      usedFallback: auditResult.usedFallback,
      warnings: auditResult.warnings,
    });
  }

  const mapped = mapAuditOutputToDb(auditResult.output, {
    validationWarnings: auditResult.warnings,
  });

  timings.jobUpdate = await updateJob(projectId, jobId, {
    progress: 70,
    step: "Generating strategic insights",
  });

  const admin = createAdminClient();
  const saveAuditTimer = createStepTimer(projectId, "saving audit_results");

  const { error: auditError } = await admin.from("audit_results").insert({
    project_id: projectId,
    summary: mapped.summary,
    mission: mapped.mission,
    positioning: mapped.positioning,
    tone: mapped.tone,
    competitors: mapped.competitors,
    insights: mapped.insights,
    color_palette: brandAssets?.colorPaletteJson ?? [],
    typography: brandAssets?.typographyJson ?? [],
  });

  if (auditError) {
    saveAuditTimer.fail(auditError);
    throw new Error(`Failed to save audit results: ${auditError.message}`);
  }
  timings.saveAuditResults = saveAuditTimer.end();

  timings.jobUpdate = await updateJob(projectId, jobId, {
    progress: 90,
    step: "Saving audit report",
  });

  const { error: projectError } = await admin
    .from("projects")
    .update({
      status: "ready",
      description: mapped.audience,
      title: deriveTitle(prompt),
    })
    .eq("id", projectId);

  if (projectError) {
    throw new Error(`Failed to update project: ${projectError.message}`);
  }

  try {
    await populateCanvasFromAssets({ projectId, boardId: input.boardId });
  } catch (error) {
    logPipelineError(projectId, "Canvas population failed (non-fatal)", error);
  }

  timings.jobUpdate = await updateJob(projectId, jobId, {
    status: "succeeded",
    progress: 100,
    step: "Audit complete",
    error: null,
  });

  timings.overall = pipelineTimer.end({ jobId });
  logPipelineTimingSummary(projectId, timings);
  logPipeline(projectId, "Pipeline succeeded", { jobId });
}

export async function runAuditPipeline(input: RunAuditPipelineInput) {
  const { projectId, jobId } = input;

  try {
    await withTimeout(
      executeAuditPipeline(input),
      PIPELINE_TIMEOUT_MS,
      "Audit pipeline"
    );
  } catch (err) {
    const message =
      err instanceof PipelineTimeoutError
        ? `Audit pipeline timed out after ${PIPELINE_TIMEOUT_MS / 1000}s. The slowest step is logged above — retry or use a simpler prompt.`
        : err instanceof Error
          ? err.message
          : "Brand audit pipeline failed.";
    await failJob(projectId, jobId, message);
  }
}
