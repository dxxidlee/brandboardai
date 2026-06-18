type SupabaseErrorLike = {
  message: string;
  hint?: string | null;
  code?: string | null;
  details?: string | null;
};

/** Surface actionable Postgres/PostgREST errors to the client. */
export function formatSupabaseError(
  error: SupabaseErrorLike,
  fallback: string
): string {
  const parts = [error.message || fallback];

  if (error.code === "42501") {
    parts.push(
      "Your account does not have permission to perform this action. If this persists, ask an admin to apply the latest database migrations."
    );
  }

  if (error.details) {
    parts.push(error.details);
  }

  if (error.hint) {
    parts.push(error.hint);
  }

  return parts.filter(Boolean).join(" ");
}
