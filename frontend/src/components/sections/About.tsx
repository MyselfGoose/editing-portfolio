"use client";

import { motion } from "motion/react";

import { EASE } from "@/lib/constants";

export function About(): React.ReactElement {
  return (
    <section
      id="about"
      className="relative border-t border-[color:var(--color-divider)] px-6 py-24 sm:px-10 sm:py-32"
      aria-labelledby="about-heading"
    >
      <header className="flex items-baseline justify-between">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          01 / About
        </span>
        <span className="text-eyebrow text-[color:var(--color-muted)] hidden sm:inline">
          Studio Note
        </span>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
        <motion.h2
          id="about-heading"
          className="font-display text-headline md:col-span-7"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1.1, ease: EASE.expoOut }}
        >
          A studio for stories that need to be felt&mdash;not just watched.
        </motion.h2>

        <motion.div
          className="md:col-span-5 md:pt-4 flex flex-col gap-6 text-base leading-relaxed text-[color:var(--color-muted)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: EASE.expoOut, delay: 0.1 }}
        >
          <p>
            We treat editing, color and motion as one craft. Every cut earns
            its place. Every silence carries weight. Every frame is chosen for
            the emotion it holds, not the effect it lands.
          </p>
          <p>
            The work moves slowly on purpose. We spend as much time watching
            the raw footage as most studios spend cutting. What survives feels
            inevitable.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-6 border-t border-[color:var(--color-divider)] pt-6 font-mono text-xs">
            <div>
              <dt className="text-[color:var(--color-dim)]">Founded</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">2019</dd>
            </div>
            <div>
              <dt className="text-[color:var(--color-dim)]">Based</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">
                [CITY]
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--color-dim)]">Reach</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">
                Worldwide
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--color-dim)]">Format</dt>
              <dd className="text-[color:var(--color-foreground)] mt-1">
                Remote-first
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
