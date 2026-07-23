import Link from "next/link";

import { BRAND, SOCIAL } from "@/lib/constants";

const SOCIAL_ENTRIES = (
  Object.entries(SOCIAL) as Array<[keyof typeof SOCIAL, string | undefined]>
).filter((entry): entry is [keyof typeof SOCIAL, string] => Boolean(entry[1]));

export function SiteFooter(): React.ReactElement {
  return (
    <footer className="flex flex-col items-start justify-between gap-4 border-t border-[color:var(--color-divider)] pt-8 font-mono text-meta text-[color:var(--color-muted)] sm:flex-row sm:items-center">
      <span className="inline-flex items-center gap-2.5">
        {/* SVG mark — next/image adds little for local SVG; keep native img. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo.svg"
          alt=""
          width={20}
          height={20}
          className="shrink-0"
        />
        <span>
          &copy; {new Date().getFullYear()} {BRAND.name}
        </span>
      </span>
      <div className="flex max-w-full flex-wrap items-center gap-3">
        {SOCIAL_ENTRIES.map(([network, url]) => (
          <a
            key={network}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-eyebrow transition-colors hover:text-[color:var(--color-foreground)]"
            aria-label={`Visit Goose Productions on ${network}`}
          >
            {network === "instagram" ? BRAND.handle : network}
          </a>
        ))}
        {SOCIAL_ENTRIES.length > 0 ? <span aria-hidden="true">/</span> : null}
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
