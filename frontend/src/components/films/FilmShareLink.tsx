import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { filmPath } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface FilmShareLinkProps {
  slug: string;
  className?: string;
}

export function FilmShareLink({
  slug,
  className,
}: FilmShareLinkProps): React.ReactElement {
  return (
    <Link
      href={filmPath(slug)}
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 text-eyebrow text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]",
        className,
      )}
    >
      <span>Open film page</span>
      <ArrowUpRight
        size={14}
        strokeWidth={1.5}
        className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
