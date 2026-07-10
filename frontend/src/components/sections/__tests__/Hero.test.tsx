import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Hero } from "@/components/sections/Hero";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

vi.mock("@/components/sections/HeroBackdrop", () => ({
  HeroBackdrop: () => <div data-testid="hero-backdrop" />,
}));

describe("Hero", () => {
  it("renders headline from constants", () => {
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
      value: 375,
    });

    renderWithProviders(<Hero />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Goose.*Portfolio/i,
    );
  });

  it("shows abbreviated reel counter on mobile", () => {
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
      value: 320,
    });

    renderWithProviders(<Hero />);
    expect(screen.getByText("01/04")).toBeInTheDocument();
  });
});
