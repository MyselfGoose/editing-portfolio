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
  const MotionDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(function MotionDiv({ children, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  });

  const MotionArticle = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement>
  >(function MotionArticle({ children, ...props }, ref) {
    return (
      <article ref={ref} {...props}>
        {children}
      </article>
    );
  });

  const MotionH2 = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
  >(function MotionH2({ children, ...props }, ref) {
    return (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    );
  });

  return {
    motion: {
      div: MotionDiv,
      article: MotionArticle,
      h2: MotionH2,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});
