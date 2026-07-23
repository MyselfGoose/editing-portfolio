import type { Project } from "@/data/projects";

interface FilmCreditsProps {
  project: Project;
  className?: string;
}

export function FilmCredits({
  project,
  className,
}: FilmCreditsProps): React.ReactElement {
  return (
    <dl
      className={
        className ??
        "flex flex-col gap-2 text-xs font-mono text-[color:var(--color-muted)]"
      }
    >
      <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
        <dt>Role</dt>
        <dd className="text-[color:var(--color-foreground)]">
          {project.credits.role}
        </dd>
      </div>
      <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
        <dt>Client</dt>
        <dd className="text-[color:var(--color-foreground)]">
          {project.credits.client}
        </dd>
      </div>
      <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
        <dt>Location</dt>
        <dd className="text-[color:var(--color-foreground)]">
          {project.location}
        </dd>
      </div>
      <div className="flex justify-between border-t border-[color:var(--color-divider)] pt-2">
        <dt>Duration</dt>
        <dd className="text-[color:var(--color-foreground)]">
          {project.video.duration}
        </dd>
      </div>
    </dl>
  );
}
