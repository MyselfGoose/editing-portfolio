"use client";

import { motion } from "motion/react";
import { useCallback, useRef, useEffect } from "react";

import type { ProjectCategory } from "@/data/projects";
import type { CategoryCount } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface FilmsFilterRailProps {
  categories: ReadonlyArray<CategoryCount>;
  totalCount: number;
  activeCategory: ProjectCategory | null;
  onCategoryChange: (category: ProjectCategory | null) => void;
}

export function FilmsFilterRail({
  categories,
  totalCount,
  activeCategory,
  onCategoryChange,
}: FilmsFilterRailProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleAll = useCallback((): void => {
    onCategoryChange(null);
  }, [onCategoryChange]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    if (active) {
      active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-0 z-30 border-b border-[color:var(--color-divider)] bg-[color:var(--color-background)]/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--section-px)]">
        <div
          ref={scrollRef}
          className="scrollbar-none flex gap-1 overflow-x-auto py-4 sm:gap-2 sm:py-5"
          role="tablist"
          aria-label="Filter films by category"
        >
          <FilterPill
            label="All"
            count={totalCount}
            isActive={activeCategory === null}
            onClick={handleAll}
          />
          {categories.map(({ category, count }) => (
            <FilterPill
              key={category}
              label={category}
              count={count}
              isActive={activeCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FilterPillProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterPill({
  label,
  count,
  isActive,
  onClick,
}: FilterPillProps): React.ReactElement {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-full px-4 py-2 text-meta transition-colors duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-foreground)]",
        isActive
          ? "text-[color:var(--color-background)]"
          : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
      )}
    >
      {isActive ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-[color:var(--color-foreground)]"
          layoutId="active-filter"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      ) : null}
      <span className="relative z-10 flex items-center gap-1.5">
        <span>{label}</span>
        <span
          className={cn(
            "tabular-nums",
            isActive
              ? "text-[color:var(--color-background)]/70"
              : "text-[color:var(--color-dim)]",
          )}
        >
          {count}
        </span>
      </span>
    </button>
  );
}
