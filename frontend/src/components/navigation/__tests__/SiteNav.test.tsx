import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesktopNav } from "@/components/navigation/DesktopNav";
import { SiteNav } from "@/components/navigation/SiteNav";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

function mockMobileBreakpoint(): void {
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
}

function mockDesktopBreakpoint(): void {
  mockMatchMediaForQuery({
    "(prefers-reduced-motion: reduce)": true,
    "(max-width: 767px)": false,
    "(min-width: 768px) and (max-width: 1023px)": false,
    "(min-width: 1024px)": true,
    "(pointer: fine)": true,
  });
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1440,
  });
}

describe("SiteNav", () => {
  it("shows mobile menu button below lg", () => {
    mockMobileBreakpoint();
    renderWithProviders(<SiteNav />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });
});

describe("DesktopNav", () => {
  it("renders route navigation links", () => {
    mockDesktopBreakpoint();
    renderWithProviders(<DesktopNav />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
  });
});
