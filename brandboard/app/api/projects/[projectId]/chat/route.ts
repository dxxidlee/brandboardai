import { NextResponse } from "next/server";

import { generateBrandChatReply, type ChatTurn } from "@/lib/ai/brand-chat";
import { getProjectAudit } from "@/lib/queries/project-audit";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { chatRequestSchema } from "@/lib/validators/chat";

const HISTORY_LIMIT = 20;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
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
      { error: "You must be signed in to chat." },
      { status: 401 }
    );
  }

  // Validate body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { message } = parsed.data;

  // Verify ownership (RLS scopes the select to the current user).
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json(
      { error: formatSupabaseError(projectError, "Failed to load project") },
      { status: projectError.code === "42501" ? 403 : 500 }
    );
  }
  if (!project) {
    return NextResponse.json(
      { error: "Project not found." },
      { status: 404 }
    );
  }

  // Load audit + brand asset context.
  const auditView = await getProjectAudit(projectId);
  if (!auditView) {
    return NextResponse.json(
      { error: "The brand audit isn't ready yet. Try again once it finishes." },
      { status: 409 }
    );
  }

  // Load recent chat history (oldest first, capped).
  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const history: ChatTurn[] = (historyRows ?? [])
    .slice()
    .reverse()
    .map((row) => ({ role: row.role, content: row.content }));

  // Persist the user's message first so the conversation is never lost.
  const { data: savedUser, error: userInsertError } = await supabase
    .from("chat_messages")
    .insert({ project_id: projectId, role: "user", content: message })
    .select("id, role, content, created_at")
    .single();

  if (userInsertError || !savedUser) {
    return NextResponse.json(
      {
        error: formatSupabaseError(
          userInsertError ?? { message: "Failed to save message" },
          "Failed to save message"
        ),
      },
      { status: userInsertError?.code === "42501" ? 403 : 500 }
    );
  }

  // Generate the assistant reply.
  let reply: string;
  try {
    reply = await generateBrandChatReply({
      audit: auditView,
      history,
      message,
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to generate a reply.";
    return NextResponse.json(
      { error: detail, userMessage: savedUser },
      { status: 502 }
    );
  }

  // Persist the assistant reply.
  const { data: savedAssistant, error: assistantInsertError } = await supabase
    .from("chat_messages")
    .insert({
      project_id: projectId,
      role: "assistant",
      content: reply,
      metadata_json: { model: "gpt-4.1-nano" },
    })
    .select("id, role, content, created_at")
    .single();

  if (assistantInsertError || !savedAssistant) {
    // The reply was generated; surface it even if persistence failed.
    return NextResponse.json({
      userMessage: savedUser,
      assistantMessage: {
        id: `tmp-${Date.now()}`,
        role: "assistant" as const,
        content: reply,
        created_at: new Date().toISOString(),
      },
      persisted: false,
    });
  }

  return NextResponse.json({
    userMessage: savedUser,
    assistantMessage: savedAssistant,
    persisted: true,
  });
}
