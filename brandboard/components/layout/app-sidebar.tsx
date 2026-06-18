import { Logo } from "@/components/layout/logo";
import { SidebarContent } from "@/components/layout/sidebar-content";

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>
      <SidebarContent />
    </aside>
  );
}
