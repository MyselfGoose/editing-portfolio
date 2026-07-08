import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import "./src/test-utils/mocks";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// matchMedia mock
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver mock
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// IntersectionObserver mock
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
  ) {}

  observe = vi.fn((target: Element): void => {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

// requestAnimationFrame / cancelAnimationFrame — do not invoke callback synchronously
// to avoid infinite RAF loops in components like CustomCursor.
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

vi.stubGlobal(
  "requestAnimationFrame",
  vi.fn((cb: FrameRequestCallback) => {
    rafId += 1;
    rafCallbacks.set(rafId, cb);
    return rafId;
  }),
);
vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => {
  rafCallbacks.delete(id);
}));
