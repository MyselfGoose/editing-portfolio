"use client";

import { useCallback, useEffect, useState } from "react";

import { NAV_LINKS } from "@/lib/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

export function DesktopNav(): React.ReactElement {
  const [activeSectionId, setActiveSectionId] = useState<string>("hero");

  useEffect(() => {
    const sectionElements = NAV_LINKS.map((link) =>
      document.getElementById(link.sectionId),
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (top?.target.id) {
          setActiveSectionId(top.target.id);
        }
      },
      {
        root: null,
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string): void => {
      event.preventDefault();
      scrollToSection(sectionId);
    },
    [],
  );

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[70] hidden lg:flex justify-end px-[var(--section-px)] py-4"
      aria-label="Site navigation"
    >
      <ul className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
        {NAV_LINKS.map((link) => {
          const isActive = activeSectionId === link.sectionId;
          return (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  "text-eyebrow transition-colors",
                  isActive
                    ? "text-[color:var(--color-foreground)]"
                    : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
                )}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => handleNavClick(event, link.sectionId)}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
