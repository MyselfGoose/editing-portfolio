"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

import { Container } from "@/components/layout/Container";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section } from "@/components/layout/Section";
import { EASE } from "@/lib/constants";

export function HomeContactCta(): React.ReactElement {
  return (
    <Section id="contact-cta" borderTop padding="default">
      <Container>
        <motion.div
          className="flex flex-col gap-8 py-8 sm:flex-row sm:items-end sm:justify-between sm:py-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: EASE.expoOut }}
        >
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="text-eyebrow text-[color:var(--color-muted)]">
              07 / Contact
            </p>
            <h2 className="font-display text-headline text-balance">
              Ready to begin your wedding film?
            </h2>
            <p className="max-w-lg text-body-lg text-[color:var(--color-muted)]">
              Tell us about the day, the footage, and the timeline. Or email us
              directly.
            </p>
          </div>

          <Link
            href="/contact"
            className="group inline-flex max-w-full flex-wrap items-center gap-3 border-b border-[color:var(--color-foreground)] pb-3 font-display text-cta transition-colors hover:text-[color:var(--color-muted)]"
          >
            <span>Get in touch</span>
            <ArrowUpRight
              size={28}
              strokeWidth={1.25}
              className="shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
            />
          </Link>
        </motion.div>

        <SiteFooter />
      </Container>
    </Section>
  );
}
