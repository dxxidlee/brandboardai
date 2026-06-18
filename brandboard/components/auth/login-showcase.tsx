import { Sparkles } from "lucide-react";

import { BRANDS } from "@/lib/mock-data";

const QUOTE =
  "Audited our competitors in an afternoon instead of a week.";

export function LoginShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-[hsl(280_60%_45%)] lg:block">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-20" />
      <div className="relative flex min-h-full flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Brandboard AI
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {BRANDS.flatMap((b) => b.references)
              .slice(0, 4)
              .map((r) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={r.id + r.url}
                  src={r.url}
                  alt={r.label}
                  className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl ring-1 ring-white/10"
                />
              ))}
          </div>
          <blockquote className="max-w-md text-xl font-medium leading-snug">
            &ldquo;{QUOTE}&rdquo;
          </blockquote>
          <p className="text-sm text-primary-foreground/70">
            Maya Chen — Creative Director, Studio North
          </p>
        </div>

        <p className="text-xs text-primary-foreground/60">
          Trusted by designers, founders and agencies.
        </p>
      </div>
    </div>
  );
}
