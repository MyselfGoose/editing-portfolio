"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { BRAND } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

export function SiteNav(): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  const close = useCallback((): void => {
    setOpen(false);
  }, []);

  const openMenu = useCallback((): void => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const menuButton = menuBtnRef.current;

    requestAnimationFrame(() => {
      firstLinkRef.current?.focus();
    });

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      menuButton?.focus();
    };
  }, [open, close]);

  const handleNavClick = useCallback(
    (sectionId: string) => {
      close();
      scrollToSection(sectionId);
    },
    [close],
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between px-[var(--section-px)] py-4 lg:hidden">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          {BRAND.short}
        </span>
        <button
          ref={menuBtnRef}
          type="button"
          onClick={open ? close : openMenu}
          className="flex h-11 w-11 items-center justify-center border border-[color:var(--color-divider)]"
          aria-expanded={open}
          aria-controls="site-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <X size={18} strokeWidth={1.25} aria-hidden="true" />
          ) : (
            <Menu size={18} strokeWidth={1.25} aria-hidden="true" />
          )}
        </button>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            id="site-nav-panel"
            ref={panelRef}
            className="fixed inset-0 z-[75] flex flex-col bg-black/95 backdrop-blur-md px-[var(--section-px)] py-24 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <nav className="flex flex-1 flex-col justify-center gap-2">
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  className={cn(
                    "font-display text-headline border-b border-[color:var(--color-divider)] py-4",
                    "text-[color:var(--color-foreground)] transition-colors",
                    "hover:text-[color:var(--color-muted)]",
                  )}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick(link.sectionId);
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
