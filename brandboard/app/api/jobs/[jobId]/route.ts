import { NextResponse } from "next/server";

import { formatSupabaseError } from "@/lib/supabase/errors";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
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
      { error: "You must be signed in to view job status." },
      { status: 401 }
    );
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "id, project_id, status, progress, step, error, kind, created_at, updated_at"
    )
    .eq("id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error, "Failed to fetch job status") },
      { status: error.code === "42501" ? 403 : 500 }
    );
  }

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
