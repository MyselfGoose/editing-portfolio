import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useIsClient } from "@/hooks/useIsClient";
import { mockMatchMedia, mockMatchMediaForQuery } from "@/test-utils/mocks";

describe("useIsClient", () => {
  it("returns true after hydration in jsdom", () => {
    const { result } = renderHook(() => useIsClient());
    expect(result.current).toBe(true);
  });
});

describe("useMediaQuery", () => {
  it("returns false when media query does not match", async () => {
    mockMatchMedia(false);
    const { useMediaQuery } = await import("@/hooks/useMediaQuery");
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("returns true when media query matches", async () => {
    mockMatchMedia(true);
    const { useMediaQuery } = await import("@/hooks/useMediaQuery");
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });
});

describe("usePrefersReducedMotion", () => {
  it("returns true when prefers-reduced-motion is reduce", async () => {
    mockMatchMediaForQuery({ "(prefers-reduced-motion: reduce)": true });
    const { usePrefersReducedMotion } = await import(
      "@/hooks/usePrefersReducedMotion"
    );
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false when prefers-reduced-motion is not reduce", async () => {
    mockMatchMediaForQuery({ "(prefers-reduced-motion: reduce)": false });
    const { usePrefersReducedMotion } = await import(
      "@/hooks/usePrefersReducedMotion"
    );
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe("useMousePosition", () => {
  it("updates position ref on pointermove", async () => {
    const { useMousePosition } = await import("@/hooks/useMousePosition");
    const { result } = renderHook(() => useMousePosition(true));

    act(() => {
      window.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 200 }),
      );
    });

    const rafMock = requestAnimationFrame as unknown as ReturnType<typeof vi.fn>;
    const rafCallback = rafMock.mock.calls.at(-1)?.[0] as
      | FrameRequestCallback
      | undefined;

    act(() => {
      rafCallback?.(0);
    });

    expect(result.current.current.x).toBe(100);
    expect(result.current.current.y).toBe(200);
  });

  it("does not attach listeners when disabled", async () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const { useMousePosition } = await import("@/hooks/useMousePosition");
    renderHook(() => useMousePosition(false));

    const pointerCalls = addSpy.mock.calls.filter(
      ([event]) => event === "pointermove",
    );
    expect(pointerCalls).toHaveLength(0);
    addSpy.mockRestore();
  });
});

describe("useScrollProgress", () => {
  it("returns 0 at top of page", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });

    const { useScrollProgress } = await import("@/hooks/useScrollProgress");
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it("returns 1 at bottom of page", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", {
      value: 1000,
      configurable: true,
    });

    const { useScrollProgress } = await import("@/hooks/useScrollProgress");
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(1);
  });
});
