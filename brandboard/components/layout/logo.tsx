import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[hsl(280_70%_60%)] text-primary-foreground shadow-sm">
        <span className="text-[15px] font-bold leading-none">B</span>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[hsl(40_95%_60%)] ring-2 ring-background" />
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight">
          Brandboard
          <span className="text-muted-foreground"> AI</span>
        </span>
      )}
    </Link>
  );
}
