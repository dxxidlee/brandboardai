import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  parseAuditInsights,
  parseCompetitors,
  parsePersonality,
  type ProjectAuditView,
} from "@/types/domain";
import {
  parseBrandAssets,
  type ProjectBrandAssets,
} from "@/types/brand-assets";

export async function getProjectAudit(
  projectId: string
): Promise<ProjectAuditView | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) return null;

  const { data: audit } = await supabase
    .from("audit_results")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!audit) return null;

  const [{ data: boards }, { data: assets }] = await Promise.all([
    supabase
      .from("boards")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(1),
    supabase.from("assets").select("*").eq("project_id", projectId),
  ]);

  const parsedInsights = parseAuditInsights(audit.insights);
  const brandAssets = parseBrandAssets(
    assets ?? [],
    audit.color_palette,
    audit.typography
  );

  return {
    project,
    audit,
    board: boards?.[0] ?? null,
    personality: parsePersonality(audit.tone),
    competitors: parseCompetitors(audit.competitors),
    insights: parsedInsights.insights,
    audience: project.description,
    confidenceLevel: parsedInsights.confidenceLevel,
    assumptions: parsedInsights.assumptions,
    needsResearch: parsedInsights.needsResearch,
    brandAssets,
    isDebugMock: parsedInsights.isDebugMock,
  };
}

export async function getLatestAuditJob(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, status, progress, step, error, created_at")
    .eq("project_id", projectId)
    .eq("kind", "audit")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getProjectChatMessages(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getProjectStatus(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, status, title, input_prompt")
    .eq("id", projectId)
    .maybeSingle();
  return data;
}

export type { ProjectBrandAssets };
