"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function DesktopNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] hidden lg:flex justify-end px-[var(--section-px)] py-4"
      aria-label="Site navigation"
    >
      <ul className="pointer-events-auto flex flex-wrap items-center justify-end gap-x-8 gap-y-2">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-nav inline-block px-1 py-2 transition-colors",
                  isActive
                    ? "text-[color:var(--color-foreground)]"
                    : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
