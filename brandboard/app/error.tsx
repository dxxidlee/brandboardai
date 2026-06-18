"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative max-w-md">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-balance text-muted-foreground">
          An unexpected error occurred while rendering this page. You can try
          again or head back to your dashboard.
        </p>
        {error?.message && (
          <p className="mx-auto mt-4 max-w-sm truncate rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
        )}
        <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button onClick={reset} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
