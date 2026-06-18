"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
  className,
  showLabel = true,
  asMenuItem = false,
}: {
  variant?: "ghost" | "outline";
  className?: string;
  showLabel?: boolean;
  asMenuItem?: boolean;
}) {
  const buttonClass = asMenuItem
    ? "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary"
    : undefined;

  return (
    <form action="/auth/signout" method="post" className={className}>
      <Button
        type="submit"
        variant={asMenuItem ? "ghost" : variant}
        size={showLabel && !asMenuItem ? "sm" : "icon"}
        className={
          buttonClass ?? (showLabel ? "w-full justify-start gap-2" : undefined)
        }
      >
        <LogOut className="h-4 w-4" />
        {showLabel && "Sign out"}
      </Button>
    </form>
  );
}
