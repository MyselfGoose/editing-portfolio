"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FilmAdjacentNav } from "@/components/films/FilmAdjacentNav";
import { FilmCredits } from "@/components/films/FilmCredits";
import { FilmPlayer } from "@/components/films/FilmPlayer";
import { Container } from "@/components/layout/Container";
import type { Project } from "@/data/projects";
import type { AdjacentFilms } from "@/lib/projects";

interface FilmPageViewProps {
  project: Project;
  adjacent: AdjacentFilms;
}

export function FilmPageView({
  project,
  adjacent,
}: FilmPageViewProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-10 pb-[clamp(3rem,8vw,5rem)] pt-[max(5rem,calc(var(--nav-offset)+1.5rem))] sm:gap-12 sm:pt-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <Link
              href="/films"
              className="inline-flex min-h-11 w-fit items-center text-eyebrow text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]"
            >
              All films
            </Link>
            <p className="text-eyebrow text-[color:var(--color-muted)]">
              {project.category} / {project.year}
            </p>
            <h1 className="font-display text-headline text-balance sm:text-massive">
              {project.title}
            </h1>
            <p className="text-body-lg text-[color:var(--color-muted)]">
              {project.location}
            </p>
          </div>
          <FilmAdjacentNav adjacent={adjacent} mode="links" />
        </div>
      </Container>

      <Container>
        <FilmPlayer project={project} />
      </Container>

      <Container>
        <div className="grid grid-cols-1 gap-10 border-t border-[color:var(--color-divider)] pt-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <p className="max-w-2xl text-body-lg text-[color:var(--color-muted)]">
              {project.description}
            </p>
          </div>
          <div className="md:col-span-5">
            <FilmCredits project={project} />
          </div>
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-6 border-t border-[color:var(--color-divider)] pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-eyebrow text-[color:var(--color-muted)]">
              Next step
            </p>
            <h2 className="font-display text-title text-balance">
              Start a film like this
            </h2>
            <p className="text-body-lg text-[color:var(--color-muted)]">
              Tell us about the day, the footage, and when you need picture
              lock.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex min-h-12 items-center gap-3 border-b border-[color:var(--color-foreground)] pb-3 font-display text-cta transition-colors hover:text-[color:var(--color-muted)]"
          >
            <span>Start a film like this</span>
            <ArrowUpRight
              size={24}
              strokeWidth={1.25}
              className="shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>
      </Container>

      {(adjacent.prev || adjacent.next) && (
        <Container>
          <nav
            aria-label="More films"
            className="grid grid-cols-1 gap-6 border-t border-[color:var(--color-divider)] pt-10 sm:grid-cols-2"
          >
            {adjacent.prev ? (
              <Link
                href={`/films/${adjacent.prev.id}`}
                className="group flex min-h-11 flex-col gap-2 transition-colors"
              >
                <span className="text-eyebrow text-[color:var(--color-dim)]">
                  Previous
                </span>
                <span className="font-display text-chapter group-hover:text-[color:var(--color-muted)]">
                  {adjacent.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {adjacent.next ? (
              <Link
                href={`/films/${adjacent.next.id}`}
                className="group flex min-h-11 flex-col gap-2 text-left sm:text-right"
              >
                <span className="text-eyebrow text-[color:var(--color-dim)]">
                  Next
                </span>
                <span className="font-display text-chapter group-hover:text-[color:var(--color-muted)]">
                  {adjacent.next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </Container>
      )}
    </div>
  );
}
