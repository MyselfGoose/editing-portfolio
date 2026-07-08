import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CinematicLoader from "@/components/experience/CinematicLoader";
import { BRAND, SESSION_KEYS } from "@/lib/constants";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

describe("CinematicLoader", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loader on first visit", () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": false,
      "(max-width: 767px)": false,
    });

    renderWithProviders(<CinematicLoader />);

    expect(screen.getByText("WELCOME TO")).toBeInTheDocument();
    expect(screen.getByText(BRAND.name.toUpperCase())).toBeInTheDocument();
  });

  it("skips loader when session flag is set", () => {
    sessionStorage.setItem(SESSION_KEYS.loaderPlayed, "1");

    const { container } = renderWithProviders(<CinematicLoader />);
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses quickly with reduced motion", async () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": true,
      "(max-width: 767px)": false,
    });

    const onFinish = vi.fn();
    renderWithProviders(<CinematicLoader onFinish={onFinish} />);

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalled();
    });
    expect(sessionStorage.getItem(SESSION_KEYS.loaderPlayed)).toBe("1");
  });
});
