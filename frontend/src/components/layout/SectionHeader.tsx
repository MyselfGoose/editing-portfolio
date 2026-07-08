import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  aside?: string;
  className?: string;
}

export function SectionHeader({
  label,
  aside,
  className,
}: SectionHeaderProps): React.ReactElement {
  return (
    <header
      className={cn("flex items-baseline justify-between gap-4", className)}
    >
      <span className="text-eyebrow text-[color:var(--color-muted)]">
        {label}
      </span>
      {aside ? (
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          {aside}
        </span>
      ) : null}
    </header>
  );
}
