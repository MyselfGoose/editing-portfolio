"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  MEDIA,
  tierFromWidth,
  type DeviceTier,
} from "@/lib/breakpoints";

interface BreakpointContextValue {
  tier: DeviceTier;
  width: number;
  finePointer: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** False during SSR — avoids hydration mismatch. */
  isHydrated: boolean;
}

const BreakpointContext = createContext<BreakpointContextValue | null>(null);

const BREAKPOINTS_FALLBACK_WIDTH = 390;

const SSR_DEFAULT: BreakpointContextValue = {
  tier: "mobile",
  width: BREAKPOINTS_FALLBACK_WIDTH,
  finePointer: false,
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isHydrated: false,
};

function readBreakpointState(isHydrated: boolean): BreakpointContextValue {
  if (typeof window === "undefined" || !isHydrated) {
    return SSR_DEFAULT;
  }

  const width = window.innerWidth;
  const tier = tierFromWidth(width);
  const finePointer = window.matchMedia(MEDIA.finePointer).matches;

  return {
    tier,
    width,
    finePointer,
    isMobile: tier === "mobile",
    isTablet: tier === "tablet",
    isDesktop: tier === "desktop",
    isHydrated: true,
  };
}

function snapshotsEqual(
  a: BreakpointContextValue,
  b: BreakpointContextValue,
): boolean {
  return (
    a.tier === b.tier &&
    a.width === b.width &&
    a.finePointer === b.finePointer &&
    a.isHydrated === b.isHydrated
  );
}

let clientSnapshot: BreakpointContextValue = SSR_DEFAULT;
const listeners = new Set<() => void>();
let listenerCount = 0;
let detachGlobalListeners: (() => void) | null = null;

function refreshSnapshot(): void {
  const next = readBreakpointState(true);
  if (snapshotsEqual(clientSnapshot, next)) return;
  clientSnapshot = next;
  listeners.forEach((listener) => listener());
}

function attachGlobalListeners(): () => void {
  const onStoreChange = (): void => refreshSnapshot();

  const mobileMq = window.matchMedia(MEDIA.mobile);
  const tabletMq = window.matchMedia(MEDIA.tablet);
  const desktopMq = window.matchMedia(MEDIA.desktop);
  const pointerMq = window.matchMedia(MEDIA.finePointer);

  mobileMq.addEventListener("change", onStoreChange);
  tabletMq.addEventListener("change", onStoreChange);
  desktopMq.addEventListener("change", onStoreChange);
  pointerMq.addEventListener("change", onStoreChange);
  window.addEventListener("resize", onStoreChange, { passive: true });

  return () => {
    mobileMq.removeEventListener("change", onStoreChange);
    tabletMq.removeEventListener("change", onStoreChange);
    desktopMq.removeEventListener("change", onStoreChange);
    pointerMq.removeEventListener("change", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  if (listenerCount === 0) {
    detachGlobalListeners = attachGlobalListeners();
    refreshSnapshot();
  }
  listenerCount += 1;

  return () => {
    listeners.delete(onStoreChange);
    listenerCount -= 1;
    if (listenerCount === 0 && detachGlobalListeners) {
      detachGlobalListeners();
      detachGlobalListeners = null;
    }
  };
}

function getClientSnapshot(): BreakpointContextValue {
  return clientSnapshot;
}

function getServerSnapshot(): BreakpointContextValue {
  return SSR_DEFAULT;
}

interface BreakpointProviderProps {
  children: React.ReactNode;
}

export function BreakpointProvider({
  children,
}: BreakpointProviderProps): React.ReactElement {
  const state = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const value = useMemo(() => state, [state]);

  return (
    <BreakpointContext.Provider value={value}>
      {children}
    </BreakpointContext.Provider>
  );
}

export function useBreakpoint(): BreakpointContextValue {
  const ctx = useContext(BreakpointContext);
  if (!ctx) {
    throw new Error("useBreakpoint must be used within BreakpointProvider");
  }
  return ctx;
}
