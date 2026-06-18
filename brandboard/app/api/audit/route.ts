import { after, NextResponse } from "next/server";

import { runDebugFastAudit } from "@/lib/pipeline/debug-fast-audit";
import { deriveTitle, runAuditPipeline } from "@/lib/pipeline/audit-pipeline";
import { createStepTimer, logPipeline } from "@/lib/pipeline/logger";
import { isAuditDebugFast } from "@/lib/env/server";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { auditRequestSchema } from "@/lib/validators/audit";

export async function POST(request: Request) {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json(
      { error: `Authentication failed: ${authError.message}` },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to create a brand audit." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { prompt, inputType } = parsed.data;
  const title = deriveTitle(prompt);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      {
        error: formatSupabaseError(
          profileError,
          "Failed to verify your profile"
        ),
      },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      {
        error:
          "Your user profile is missing. Sign out, sign in again, then retry.",
      },
      { status: 403 }
    );
  }

  const projectTimer = createStepTimer("pending", "project creation");
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      input_prompt: prompt,
      input_type: inputType,
      status: "generating",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    projectTimer.fail(projectError ?? "Failed to create project");
    return NextResponse.json(
      {
        error: formatSupabaseError(
          projectError ?? { message: "Failed to create project" },
          "Failed to create project"
        ),
      },
      { status: projectError?.code === "42501" ? 403 : 500 }
    );
  }

  const projectCreationMs = projectTimer.end({ projectId: project.id });
  logPipeline(project.id, "project creation", {
    durationMs: projectCreationMs,
    status: "ok",
  });

  const boardTimer = createStepTimer(project.id, "board creation");
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .insert({
      project_id: project.id,
      name: "Moodboard v1",
    })
    .select("id")
    .single();

  if (boardError || !board) {
    boardTimer.fail(boardError ?? "Failed to create board");
    return NextResponse.json(
      {
        error: formatSupabaseError(
          boardError ?? { message: "Failed to create board" },
          "Failed to create board"
        ),
        projectId: project.id,
      },
      { status: boardError?.code === "42501" ? 403 : 500 }
    );
  }
  boardTimer.end({ boardId: board.id });

  const jobTimer = createStepTimer(project.id, "job creation");
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      project_id: project.id,
      user_id: user.id,
      kind: "audit",
      status: "queued",
      progress: 0,
      step: "Queued",
    })
    .select("id")
    .single();

  if (jobError || !job) {
    jobTimer.fail(jobError ?? "Failed to create job");
    return NextResponse.json(
      {
        error: formatSupabaseError(
          jobError ?? { message: "Failed to create job" },
          "Failed to create job"
        ),
        projectId: project.id,
        boardId: board.id,
      },
      { status: jobError?.code === "42501" ? 403 : 500 }
    );
  }
  jobTimer.end({ jobId: job.id });

  const debugFast = isAuditDebugFast();

  if (debugFast) {
    try {
      await runDebugFastAudit({
        projectId: project.id,
        jobId: job.id,
        prompt,
        inputType,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Debug-fast audit failed.";
      return NextResponse.json(
        { error: message, projectId: project.id, boardId: board.id, jobId: job.id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projectId: project.id,
      boardId: board.id,
      jobId: job.id,
      debugMock: true,
      ready: true,
    });
  }

  after(() =>
    runAuditPipeline({
      projectId: project.id,
      jobId: job.id,
      boardId: board.id,
      prompt,
      inputType,
    })
  );

  return NextResponse.json({
    projectId: project.id,
    boardId: board.id,
    jobId: job.id,
  });
}
