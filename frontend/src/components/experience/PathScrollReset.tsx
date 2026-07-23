"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { resetScrollPosition } from "@/lib/scroll-layout";

interface PathScrollResetProps {
  children?: React.ReactNode;
}

/**
 * Light-route scroll helper: native scroll only, no Lenis / GSAP ticker.
 * Effect-only — does not wrap the tree so SiteNav survives mode switches.
 */
export function PathScrollReset({
  children,
}: PathScrollResetProps): React.ReactElement {
  const pathname = usePathname();
  const isInitialPathnameRef = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (isInitialPathnameRef.current) {
      isInitialPathnameRef.current = false;
      return;
    }
    resetScrollPosition();
  }, [pathname]);

  return <>{children}</>;
}
