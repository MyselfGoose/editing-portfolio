"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PARTNERS, type Partner } from "@/data/partners";
import { useRevealMotion } from "@/hooks/useRevealMotion";
import { BRAND, EASE } from "@/lib/constants";

function PartnerTile({
  partner,
  index,
}: {
  partner: Partner;
  index: number;
}): React.ReactElement {
  const revealMotion = useRevealMotion();

  return (
    <motion.li
      variants={revealMotion.variants}
      initial={revealMotion.initial}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.9,
        ease: EASE.expoOut,
        delay: index * 0.08,
      }}
      className="border-t border-[color:var(--color-divider)] md:border-t-0 md:border-l md:first:border-l-0"
    >
      <a
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-12 items-center gap-5 py-8 transition-colors md:flex-col md:items-start md:gap-6 md:px-8 md:py-4 md:first:pl-0 md:last:pr-0"
        aria-label={`${partner.name} on Instagram, opens in a new tab`}
      >
        <div className="relative size-16 shrink-0 overflow-hidden border border-[color:var(--color-divider)] sm:size-20">
          <Image
            src={partner.imageSrc}
            alt={partner.imageAlt}
            width={80}
            height={80}
            className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:w-full">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-chapter text-balance transition-colors group-hover:text-[color:var(--color-muted)]">
              {partner.name}
            </h3>
            <ArrowUpRight
              size={20}
              strokeWidth={1.25}
              className="mt-1 shrink-0 text-[color:var(--color-dim)] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[color:var(--color-foreground)]"
              aria-hidden
            />
          </div>
          <p className="font-mono text-xs text-[color:var(--color-dim)]">
            @{partner.handle}
          </p>
          <p className="mt-1 text-eyebrow text-[color:var(--color-muted)]">
            Instagram
          </p>
        </div>
      </a>
    </motion.li>
  );
}

export function Partners(): React.ReactElement {
  const revealMotion = useRevealMotion();

  return (
    <Section id="partners" labelledBy="partners-heading" borderTop>
      <Container>
        <SectionHeader label="05 / Partners" aside="Collaborators" />

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:mt-12"
          variants={revealMotion.variants}
          initial={revealMotion.initial}
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: EASE.expoOut }}
        >
          <h2
            id="partners-heading"
            className="font-display text-headline max-w-3xl text-balance"
          >
            Independent studios working with {BRAND.name}.
          </h2>
          <p className="max-w-2xl text-body-lg text-[color:var(--color-muted)]">
            {BRAND.name} is the parent studio. These independent groups
            collaborate with us — and with each other — on wedding and
            celebration films.
          </p>
        </motion.div>

        <ul className="mt-14 grid grid-cols-1 border-b border-[color:var(--color-divider)] md:mt-16 md:grid-cols-3 md:border-t md:border-b-0 md:pt-4">
          {PARTNERS.map((partner, index) => (
            <PartnerTile
              key={partner.handle}
              partner={partner}
              index={index}
            />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
