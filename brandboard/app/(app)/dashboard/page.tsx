import { redirect } from "next/navigation";

/** The dashboard is retired — the AI workspace at /new is the home. */
export default function DashboardPage() {
  redirect("/new");
}
