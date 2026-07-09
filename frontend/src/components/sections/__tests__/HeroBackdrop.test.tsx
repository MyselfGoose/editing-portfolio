import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "@/components/sections/Hero";
import { HeroBackdrop } from "@/components/sections/HeroBackdrop";
import { HeroMediaProvider } from "@/components/sections/HeroMediaContext";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

function mockMobileCinematic(): void {
  mockMatchMediaForQuery({
    "(prefers-reduced-motion: reduce)": false,
    "(max-width: 767px)": true,
    "(min-width: 768px) and (max-width: 1023px)": false,
    "(min-width: 1024px)": false,
    "(pointer: fine)": false,
    "(pointer: coarse)": true,
  });
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 390,
  });
}

describe("HeroBackdrop", () => {
  it("mounts ambient video on mobile when motion is allowed", async () => {
    mockMobileCinematic();

    renderWithProviders(
      <HeroMediaProvider>
        <HeroBackdrop />
      </HeroMediaProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("mux-video")).toBeInTheDocument();
    });
  });

  it("keeps poster-only fallback when reduced motion is enabled", async () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": true,
      "(max-width: 767px)": true,
      "(min-width: 768px) and (max-width: 1023px)": false,
      "(min-width: 1024px)": false,
      "(pointer: fine)": false,
    });
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });

    renderWithProviders(
      <HeroMediaProvider>
        <HeroBackdrop />
      </HeroMediaProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("mux-video")).not.toBeInTheDocument();
    });
    expect(document.querySelector('img[src*="image.mux.com"]')).not.toBeNull();
  });
});

describe("Hero cinematic controls", () => {
  it("shows audio toggle on mobile when ambient video is enabled", async () => {
    mockMobileCinematic();

    renderWithProviders(<Hero />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Unmute hero video" }),
      ).toBeInTheDocument();
    });
  });
});
