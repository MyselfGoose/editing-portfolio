import { useHydrationSafeBreakpoint } from "@/hooks/useHydrationSafeBreakpoint";
import { useMounted } from "@/hooks/useMounted";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface CinematicCapabilityInput {
  mounted: boolean;
  isHydrated: boolean;
  reducedMotion: boolean;
}

export interface CinematicCapabilities {
  canPlayAmbientVideo: boolean;
  canUseScrollScrub: boolean;
}

/**
 * Shared gate for ambient hero video and Process scroll-pin scrub.
 * Independent of device tier and pointer type — only hydration and reduced motion matter.
 */
export function getCinematicCapabilities(
  input: CinematicCapabilityInput,
): CinematicCapabilities {
  const enabled = input.mounted && input.isHydrated && !input.reducedMotion;
  return {
    canPlayAmbientVideo: enabled,
    canUseScrollScrub: enabled,
  };
}

export function useCinematicCapabilities(): CinematicCapabilities {
  const mounted = useMounted();
  const { isHydrated } = useHydrationSafeBreakpoint();
  const reducedMotion = usePrefersReducedMotion();

  return getCinematicCapabilities({ mounted, isHydrated, reducedMotion });
}
