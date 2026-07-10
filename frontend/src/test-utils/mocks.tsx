import React from "react";
import { vi } from "vitest";

export function mockMatchMedia(matches: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

export function mockMatchMediaForQuery(
  queryMap: Record<string, boolean>,
): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: queryMap[query] ?? false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@mux/mux-player-react", () => ({
  default: ({
    "aria-label": ariaLabel,
    playbackId,
  }: {
    "aria-label"?: string;
    playbackId?: string;
  }) => (
    <div data-testid="mux-player" aria-label={ariaLabel} data-playback-id={playbackId} />
  ),
}));

vi.mock("@mux/mux-video-react", () => ({
  default: React.forwardRef<
    HTMLVideoElement,
    { playbackId?: string; poster?: string }
  >(function MockMuxVideo({ playbackId, poster }, ref) {
    return (
      <video
        ref={ref}
        data-testid="mux-video"
        data-playback-id={playbackId}
        poster={poster}
        // jsdom does not implement HTMLMediaElement.play()
        onLoadedData={(event) => {
          const node = event.currentTarget;
          node.play = () => Promise.resolve();
        }}
      />
    );
  }),
}));

vi.mock("gsap", () => {
  const timeline = {
    set: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    kill: vi.fn(),
    onComplete: undefined as (() => void) | undefined,
  };

  const gsapMock = {
    set: vi.fn(),
    timeline: vi.fn((opts?: { onComplete?: () => void }) => {
      timeline.onComplete = opts?.onComplete;
      return timeline;
    }),
    registerPlugin: vi.fn(),
  };

  return { default: gsapMock };
});

vi.mock("@gsap/react", () => ({
  useGSAP: (callback: () => void | (() => void)) => {
    const cleanup = callback();
    return cleanup;
  },
}));

vi.mock("motion/react", () => {
  function createMotionElement(tag: string) {
    return React.forwardRef<
      HTMLElement,
      React.HTMLAttributes<HTMLElement> & Record<string, unknown>
    >(function MotionElement({ children, ...props }, ref) {
      const domProps = { ...props } as React.HTMLAttributes<HTMLElement>;
      delete (domProps as Record<string, unknown>).initial;
      delete (domProps as Record<string, unknown>).animate;
      delete (domProps as Record<string, unknown>).exit;
      delete (domProps as Record<string, unknown>).variants;
      delete (domProps as Record<string, unknown>).transition;
      delete (domProps as Record<string, unknown>).whileInView;
      delete (domProps as Record<string, unknown>).viewport;
      return React.createElement(
        tag,
        { ref, ...domProps },
        children as React.ReactNode,
      );
    });
  }

  const cache = new Map<string, ReturnType<typeof createMotionElement>>();
  const motion = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (!cache.has(prop)) {
          cache.set(prop, createMotionElement(prop));
        }
        return cache.get(prop);
      },
    },
  ) as Record<string, ReturnType<typeof createMotionElement>>;

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    MotionConfig: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});
