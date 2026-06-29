import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <div className="relative">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="font-display text-7xl italic text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This board doesn&apos;t exist
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-balance text-muted-foreground">
          The page you&apos;re looking for may have been moved, deleted, or never
          existed in the first place.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild className="gap-1.5">
            <Link href="/new">
              <Compass className="h-4 w-4" />
              Go to workspace
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
