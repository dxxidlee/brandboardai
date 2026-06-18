import { Suspense } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";
import { LoginFormFallback } from "@/components/auth/login-form-fallback";
import { LoginShowcase } from "@/components/auth/login-showcase";

/** Auth-aware page — avoid stale static shell when session/search params change. */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: auth form */}
      <div className="relative flex min-h-screen flex-col bg-background px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Right: brand showcase */}
      <LoginShowcase />
    </div>
  );
}
