import Link from "next/link";

import { BRAND } from "@/lib/constants";

export function SiteFooter(): React.ReactElement {
  return (
    <footer className="flex flex-col items-start justify-between gap-4 border-t border-[color:var(--color-divider)] pt-8 font-mono text-meta text-[color:var(--color-muted)] sm:flex-row sm:items-center">
      <span>&copy; {new Date().getFullYear()} {BRAND.name}</span>
      <div className="flex max-w-full flex-wrap items-center gap-3">
        <span className="text-balance uppercase tracking-[0.2em]">
          {BRAND.name} / All rights reserved
        </span>
        <span aria-hidden="true">/</span>
        <Link
          href="/privacy"
          className="text-eyebrow transition-colors hover:text-[color:var(--color-foreground)]"
        >
          Privacy
        </Link>
      </div>
    </footer>
  );
}
