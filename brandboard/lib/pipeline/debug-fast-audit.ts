import "server-only";

import { deriveTitle } from "@/lib/pipeline/derive-title";
import { buildMockAuditDbPayload } from "@/lib/pipeline/mock-audit-data";
import {
  createStepTimer,
  logPipeline,
  logPipelineTimingSummary,
} from "@/lib/pipeline/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type ProjectInputType = Database["public"]["Enums"]["project_input_type"];

export type RunDebugFastAuditInput = {
  projectId: string;
  jobId: string;
  prompt: string;
  inputType: ProjectInputType;
};

export async function runDebugFastAudit(input: RunDebugFastAuditInput) {
  const { projectId, jobId, prompt } = input;
  const timings: Record<string, number> = {};
  const overall = createStepTimer(projectId, "debug-fast audit");

  logPipeline(projectId, "Debug-fast mode: skipping Brandfetch and OpenAI", {
    jobId,
  });

  const admin = createAdminClient();
  const brandName = deriveTitle(prompt);
  const mock = buildMockAuditDbPayload(brandName);

  const jobStartTimer = createStepTimer(projectId, "job update");
  await admin
    .from("jobs")
    .update({
      status: "running",
      progress: 50,
      step: "Writing mock audit",
    })
    .eq("id", jobId);
  timings.jobUpdate = jobStartTimer.end({ step: "Writing mock audit" });

  const saveAuditTimer = createStepTimer(projectId, "saving audit_results");
  const { error: auditError } = await admin.from("audit_results").insert({
    project_id: projectId,
    summary: mock.summary,
    mission: mock.mission,
    positioning: mock.positioning,
    tone: mock.tone,
    competitors: mock.competitors,
    insights: mock.insights,
    color_palette: mock.color_palette,
    typography: mock.typography,
  });

  if (auditError) {
    saveAuditTimer.fail(auditError);
    throw new Error(`Failed to save mock audit results: ${auditError.message}`);
  }
  timings.saveAuditResults = saveAuditTimer.end();

  const projectTimer = createStepTimer(projectId, "project update");
  const { error: projectError } = await admin
    .from("projects")
    .update({
      status: "ready",
      description: mock.audience,
      title: brandName,
    })
    .eq("id", projectId);

  if (projectError) {
    projectTimer.fail(projectError);
    throw new Error(`Failed to update project: ${projectError.message}`);
  }
  timings.projectUpdate = projectTimer.end();

  const jobDoneTimer = createStepTimer(projectId, "job update");
  const { error: jobError } = await admin
    .from("jobs")
    .update({
      status: "succeeded",
      progress: 100,
      step: "Audit complete",
      error: null,
    })
    .eq("id", jobId);

  if (jobError) {
    jobDoneTimer.fail(jobError);
    throw new Error(`Failed to complete job: ${jobError.message}`);
  }
  timings.jobUpdateFinal = jobDoneTimer.end();

  timings.overall = overall.end({ mode: "debug_mock" });
  logPipelineTimingSummary(projectId, timings);
  logPipeline(projectId, "Debug-fast audit succeeded", { jobId });
}
