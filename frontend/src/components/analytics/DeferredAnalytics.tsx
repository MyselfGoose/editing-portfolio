"use client";

import { Analytics } from "@vercel/analytics/react";

import { useMounted } from "@/hooks/useMounted";
import { ANALYTICS } from "@/lib/constants";

export function DeferredAnalytics(): React.ReactElement | null {
  const mounted = useMounted();

  if (!ANALYTICS.enabled || !mounted) {
    return null;
  }

  return <Analytics />;
}
