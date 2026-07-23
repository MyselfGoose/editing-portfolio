"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { AdjacentFilms } from "@/lib/projects";
import { filmPath } from "@/lib/projects";
import { cn } from "@/lib/utils";

type FilmAdjacentMode = "buttons" | "links";

interface FilmAdjacentNavProps {
  adjacent: AdjacentFilms;
  mode: FilmAdjacentMode;
  onNavigate?: (direction: "prev" | "next") => void;
  className?: string;
}

const buttonClass = (enabled: boolean): string =>
  cn(
    "flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-divider)] transition-colors",
    enabled
      ? "hover:bg-[color:var(--color-elevated)]"
      : "cursor-not-allowed opacity-30",
  );

export function FilmAdjacentNav({
  adjacent,
  mode,
  onNavigate,
  className,
}: FilmAdjacentNavProps): React.ReactElement {
  const hasPrev = adjacent.prev !== null;
  const hasNext = adjacent.next !== null;

  if (mode === "links") {
    return (
      <nav
        aria-label="Adjacent films"
        className={cn("flex items-center gap-2", className)}
      >
        {hasPrev && adjacent.prev ? (
          <Link
            href={filmPath(adjacent.prev.id)}
            className={buttonClass(true)}
            aria-label={`Previous film: ${adjacent.prev.title}`}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </Link>
        ) : (
          <span className={buttonClass(false)} aria-disabled="true">
            <ChevronLeft size={18} strokeWidth={1.5} />
          </span>
        )}
        {hasNext && adjacent.next ? (
          <Link
            href={filmPath(adjacent.next.id)}
            className={buttonClass(true)}
            aria-label={`Next film: ${adjacent.next.title}`}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </Link>
        ) : (
          <span className={buttonClass(false)} aria-disabled="true">
            <ChevronRight size={18} strokeWidth={1.5} />
          </span>
        )}
      </nav>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onNavigate?.("prev")}
        disabled={!hasPrev}
        className={buttonClass(hasPrev)}
        aria-label="Previous film"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={() => onNavigate?.("next")}
        disabled={!hasNext}
        className={buttonClass(hasNext)}
        aria-label="Next film"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
