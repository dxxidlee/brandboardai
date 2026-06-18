"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Mode = "sign-in" | "sign-up";
type Status = "idle" | "loading" | "success" | "error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = React.useState<Mode>("sign-in");
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Sign in failed. Please try again."
      : null
  );

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const loading = status === "loading";

  const resetFeedback = () => {
    if (status !== "loading") {
      setMessage(null);
      setStatus("idle");
    }
  };

  const handleGoogleSignIn = async () => {
    setStatus("loading");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(getAuthErrorMessage(error.message));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const supabase = createClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus("error");
        setMessage(getAuthErrorMessage(error.message));
        return;
      }

      setStatus("success");
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(getAuthErrorMessage(error.message));
      return;
    }

    if (data.session) {
      setStatus("success");
      router.push(next);
      router.refresh();
      return;
    }

    setStatus("success");
    setMessage(
      "Account created. Check your email to confirm your address, then sign in."
    );
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "sign-in"
            ? "Sign in to your Brandboard workspace."
            : "Start building brand boards in minutes."}
        </p>
      </div>

      {status === "success" && message && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl border border-[hsl(140_50%_45%)]/30 bg-[hsl(140_50%_45%)]/10 px-3 py-2.5 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(140_50%_42%)]" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && message && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {message}
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2.5"
          disabled={loading}
          onClick={handleGoogleSignIn}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">
          or continue with email
        </span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "sign-up" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                resetFeedback();
              }}
              disabled={loading}
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              resetFeedback();
            }}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              disabled={loading}
            >
              Forgot?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={mode === "sign-up" ? "At least 6 characters" : "••••••••"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              resetFeedback();
            }}
            required
            minLength={6}
            disabled={loading}
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
          />
        </div>

        <Button type="submit" className="w-full gap-1.5" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "sign-in" ? "Signing in…" : "Creating account…"}
            </>
          ) : (
            <>
              {mode === "sign-in" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground hover:underline"
              onClick={() => {
                setMode("sign-up");
                resetFeedback();
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground hover:underline"
              onClick={() => {
                setMode("sign-in");
                resetFeedback();
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
