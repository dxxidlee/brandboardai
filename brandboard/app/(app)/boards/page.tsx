import { ProjectsExplorer } from "@/components/dashboard/projects-explorer";

export default function BoardsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Boards</h1>
        <p className="mt-1 text-muted-foreground">
          Your moodboards and creative canvases.
        </p>
      </div>
      <ProjectsExplorer initialFilter="Moodboard" />
    </div>
  );
}
