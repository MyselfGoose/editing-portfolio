"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { EASE } from "@/lib/constants";

export function InvestmentNote(): React.ReactElement {
  const revealMotion = useRevealMotion();

  return (
    <Section id="investment" labelledBy="investment-heading" borderTop>
      <Container>
        <motion.div
          className="flex flex-col gap-8 py-4 sm:flex-row sm:items-end sm:justify-between sm:py-6"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: EASE.expoOut }}
        >
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="text-eyebrow text-[color:var(--color-muted)]">
              Investment
            </p>
            <h2
              id="investment-heading"
              className="font-display text-headline text-balance"
            >
              Every film is quoted individually.
            </h2>
            <p className="max-w-xl text-body-lg text-[color:var(--color-muted)]">
              Scope follows runtime, footage volume, deadline, and a focused
              revision pass. Share those details on the contact form and we will
              reply with a clear next step — not a one-size rate card.
            </p>
          </div>

          <Link
            href="/contact"
            className="group inline-flex min-h-12 max-w-full flex-wrap items-center gap-3 border-b border-[color:var(--color-foreground)] pb-3 font-display text-cta transition-colors hover:text-[color:var(--color-muted)]"
          >
            <span>Start a project</span>
            <ArrowUpRight
              size={28}
              strokeWidth={1.25}
              className="shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
            />
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
}
