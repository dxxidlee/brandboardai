"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getUserDisplay(user: User) {
  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { name, email: user.email ?? "", initials };
}

export function TopBar({ user }: { user: User }) {
  const { name, email, initials } = getUserDisplay(user);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border glass px-3 sm:px-4 lg:px-6">
      <MobileNav />
      <div className="lg:hidden">
        <Logo showWordmark={false} />
      </div>

      <div className="relative ml-1 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, brands, boards…"
          className="h-9 border-transparent bg-secondary/70 pl-9 transition-colors focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground lg:flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
        >
          <Search className="h-[18px] w-[18px]" />
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </Link>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none ring-ring transition-opacity hover:opacity-90 focus-visible:ring-2">
              <Avatar className="h-9 w-9 ring-1 ring-border">
                <AvatarFallback className="bg-primary/15 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium text-foreground">{name}</div>
              <div className="font-normal text-muted-foreground">{email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Billing</DropdownMenuItem>
            <DropdownMenuItem disabled>Help &amp; support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton asMenuItem showLabel className="w-full" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
