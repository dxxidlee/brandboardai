import { Loader2 } from "lucide-react";

/** Server-rendered Suspense fallback for the login form. */
export function LoginFormFallback() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading sign in…</p>
    </div>
  );
}
