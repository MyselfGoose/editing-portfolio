import {
  SSR_BREAKPOINT_DEFAULT,
  useBreakpoint,
} from "@/components/providers/BreakpointProvider";
import { useMounted } from "@/hooks/useMounted";

/**
 * Returns SSR/mobile defaults until the component has mounted,
 * preventing hydration mismatches in lazily hydrated client sections.
 */
export function useHydrationSafeBreakpoint() {
  const breakpoint = useBreakpoint();
  const mounted = useMounted();
  return mounted ? breakpoint : SSR_BREAKPOINT_DEFAULT;
}
