import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { HomeExperience } from "@/components/home/home-experience";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

/** Auth-aware entry point — no marketing landing page. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in users go straight to the product.
  if (user) {
    redirect("/new");
  }

  // Signed-out users see the AI homepage with Sign in / Get started.
  return (
    <div className="bg-aurora relative flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/login">Get started</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <HomeExperience signedOut />
      </main>
    </div>
  );
}
