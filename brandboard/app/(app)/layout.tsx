import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-aurora relative flex min-h-svh">
      <HomeSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 px-3 lg:hidden">
          <MobileNav />
          <Logo showWordmark={false} />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
